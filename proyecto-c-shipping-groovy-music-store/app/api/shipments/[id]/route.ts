import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requiereAuth } from "@/lib/auth-api";
import { esAdmin } from "@/lib/roles";
import { notificarEstadoEnvio } from "@/lib/notificarBuyer";
import { notificarEntregaExitosa } from "@/lib/notificarPayments";

// Detalle de un envío por UUID (Control Plane)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  try {
    const { id } = await params;

    const envio = await prisma.envio.findUnique({
      where: { id },
      include: {
        empresa: { select: { id: true, nombre: true } },
        direccionDestino: true,
        direccionOrigen: true,
        eventos: { orderBy: { timestamp: "desc" } },
      },
    });

    if (!envio) {
      return NextResponse.json({ error: "envio_no_encontrado", mensaje: "Envío no encontrado" }, { status: 404 });
    }

    // Si es operador, solo ve envíos de su empresa
    const ctx = authResult.ctx;
    if (ctx.tipo === "usuario" && !esAdmin(ctx.role) && envio.empresaId !== ctx.empresaId) {
      return NextResponse.json({ error: "sin_permisos" }, { status: 403 });
    }

    return NextResponse.json({
      id: envio.id,
      order_id: envio.order_id,
      codigo_seguimiento: envio.codigo_seguimiento,
      estado: envio.estado,
      seller_id: envio.seller_id,
      buyer_id: envio.buyer_id,
      fecha_entrega_estimada: envio.fecha_entrega_estimada,
      empresa: envio.empresa,
      direccionDestino: envio.direccionDestino,
      ...(envio.direccionOrigen && { direccionOrigen: envio.direccionOrigen }),
      eventos: envio.eventos.map((ev) => ({
        id: ev.id,
        descripcion: ev.descripcion,
        timestamp: ev.timestamp,
      })),
    });
  } catch (error) {
    console.error("Error al obtener envío:", error);
    return NextResponse.json({ error: "error_interno", mensaje: "Error interno" }, { status: 500 });
  }
}

// Modificar envío (Control Plane — cambiar estado, empresa, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  try {
    const { id } = await params;
    const ctx = authResult.ctx;
    const body = await req.json();

    const envioActual = await prisma.envio.findUnique({ where: { id } });
    if (!envioActual) {
      return NextResponse.json({ error: "envio_no_encontrado", mensaje: "Envío no encontrado" }, { status: 404 });
    }

    // Si es operador, solo modifica envíos de su empresa
    if (ctx.tipo === "usuario" && !esAdmin(ctx.role) && envioActual.empresaId !== ctx.empresaId) {
      return NextResponse.json({ error: "sin_permisos" }, { status: 403 });
    }

    const dataToUpdate: any = {};
    const eventosCrear: string[] = [];

    // Cambio de estado
    if (body.estado) {
      const estadosValidos = ["EN PREPARACIÓN", "EN CAMINO", "ENTREGADO"];
      if (!estadosValidos.includes(body.estado)) {
        return NextResponse.json({ error: "estado_invalido", mensaje: "Estado inválido" }, { status: 400 });
      }
      dataToUpdate.estado = body.estado;
      eventosCrear.push(`Estado cambiado a ${body.estado}`);
    }

    // Reasignar empresa
    if (body.empresaId) {
      const empresa = await prisma.empresa.findUnique({ where: { id: body.empresaId } });
      if (!empresa) {
        return NextResponse.json({ error: "empresa_no_encontrada", mensaje: "Empresa no encontrada" }, { status: 404 });
      }
      dataToUpdate.empresaId = body.empresaId;
      eventosCrear.push(`Reasignado a empresa ${empresa.nombre}`);
    }

    // Cambiar fecha estimada
    if (body.fecha_entrega_estimada) {
      dataToUpdate.fecha_entrega_estimada = new Date(body.fecha_entrega_estimada);
      eventosCrear.push("Fecha de entrega estimada actualizada");
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: "sin_cambios", mensaje: "No se enviaron campos para modificar" }, { status: 400 });
    }

    // Actualizar en transacción
    const envioActualizado = await prisma.$transaction(async (tx) => {
      const envio = await tx.envio.update({
        where: { id },
        data: dataToUpdate,
        include: { empresa: { select: { id: true, nombre: true } } },
      });

      // Crear eventos de historial
      for (const desc of eventosCrear) {
        await tx.eventoDeEnvio.create({
          data: { envio_id: id, descripcion: desc },
        });
      }

      return envio;
    });

    // Notificar a otros servicios si cambió el estado
// Notificar a otros servicios si cambió el estado
    if (body.estado) {
      notificarEstadoEnvio({
        ordenId: envioActualizado.order_id,
        codigoSeguimiento: envioActualizado.codigo_seguimiento,
        estado: envioActualizado.estado,
      }).catch((err) => console.error("Error notificando a Buyer:", err));

      if (body.estado === "ENTREGADO") {
        notificarEntregaExitosa(
          envioActualizado.order_id,
          envioActualizado.codigo_seguimiento,
          new Date()
        ).catch((err) => console.error("Error notificando a Payments:", err));
      }
    }

    return NextResponse.json({
      id: envioActualizado.id,
      estado: envioActualizado.estado,
      empresa: envioActualizado.empresa,
      mensaje: "Envío actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar envío:", error);
    return NextResponse.json({ error: "error_interno", mensaje: "Error al actualizar" }, { status: 500 });
  }
}

// Eliminar envío (Control Plane)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  const ctx = authResult.ctx;
  // Solo admin/super_admin o servicio pueden eliminar
  if (ctx.tipo === "usuario" && !esAdmin(ctx.role)) {
    return NextResponse.json({ error: "sin_permisos", mensaje: "Solo administradores pueden eliminar envíos" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const envio = await prisma.envio.findUnique({ where: { id } });
    if (!envio) {
      return NextResponse.json({ error: "envio_no_encontrado", mensaje: "Envío no encontrado" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.eventoDeEnvio.deleteMany({ where: { envio_id: id } });
      await tx.envio.delete({ where: { id } });
    });

    return NextResponse.json({ estado: "eliminado", id });
  } catch (error) {
    console.error("Error al eliminar envío:", error);
    return NextResponse.json({ error: "error_interno", mensaje: "Error al eliminar" }, { status: 500 });
  }
}