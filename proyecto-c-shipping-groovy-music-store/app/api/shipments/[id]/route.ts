import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requiereAuth } from "@/lib/auth-api";

// Detalle completo de un envío con historial (Control Plane / Analytics)
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
        direccion: true,
        empresa: true,
        eventos: { orderBy: { timestamp: "desc" } },
      },
    });

    if (!envio) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id: envio.id,
      order_id: envio.order_id,
      codigo_seguimiento: envio.codigo_seguimiento,
      estado: envio.estado,
      seller_id: envio.seller_id,
      buyer_id: envio.buyer_id,
      fecha_entrega_estimada: envio.fecha_entrega_estimada,
      empresa: {
        id: envio.empresa.id,
        nombre: envio.empresa.nombre,
      },
      direccion: {
        calle: envio.direccion.calle,
        ciudad: envio.direccion.ciudad,
        provincia: envio.direccion.provincia,
        cod_postal: envio.direccion.cod_postal,
        pais: envio.direccion.pais,
      },
      eventos: envio.eventos.map((e) => ({
        id: e.id,
        descripcion: e.descripcion,
        timestamp: e.timestamp,
      })),
    });
  } catch (error) {
    console.error("Error al obtener detalle:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Editar envío desde Control Plane (estado, empresa, dirección, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  // Solo admin o servicio pueden editar
  const ctx = authResult.ctx;
  if (ctx.tipo === "usuario" && ctx.role !== "ADMIN") {
    return NextResponse.json({ error: "sin_permisos" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const envioActual = await prisma.envio.findUnique({ where: { id } });
    if (!envioActual) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
    }

    // Campos editables
    const dataUpdate: any = {};
    if (body.estado) {
      const estadosValidos = ["EN PREPARACIÓN", "EN CAMINO", "ENTREGADO"];
      if (!estadosValidos.includes(body.estado)) {
        return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
      }
      dataUpdate.estado = body.estado;
    }
    if (body.empresaId) dataUpdate.empresaId = body.empresaId;
    if (body.fecha_entrega_estimada) dataUpdate.fecha_entrega_estimada = new Date(body.fecha_entrega_estimada);

    const envio = await prisma.$transaction(async (tx) => {
      const updated = await tx.envio.update({
        where: { id },
        data: dataUpdate,
      });

      if (body.estado && body.estado !== envioActual.estado) {
        await tx.eventoDeEnvio.create({
          data: {
            envio_id: updated.id,
            descripcion: `Estado actualizado a: ${body.estado} (Control Plane)`,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({
      id: envio.id,
      estado: envio.estado,
      order_id: envio.order_id,
    });
  } catch (error) {
    console.error("Error al editar envío:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Eliminar envío desde Control Plane
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  const ctx = authResult.ctx;
  if (ctx.tipo === "usuario" && ctx.role !== "ADMIN") {
    return NextResponse.json({ error: "sin_permisos" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const envio = await prisma.envio.findUnique({ where: { id } });
    if (!envio) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.eventoDeEnvio.deleteMany({ where: { envio_id: id } });
      await tx.envio.delete({ where: { id } });
    });

    return NextResponse.json({ estado: "eliminado", id });
  } catch (error) {
    console.error("Error al eliminar envío:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
