import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requiereAuth } from "@/lib/auth-api";
import { esAdmin } from "@/lib/roles";
import { notificarEstadoEnvio } from "@/lib/notificarBuyer";
import { notificarEntregaExitosa } from "@/lib/notificarPayments";

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
    const ctx = authResult.ctx;

    const envio = await prisma.envio.findUnique({ where: { id } });

    if (!envio) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
    }

    if (ctx.tipo === "usuario" && !esAdmin(ctx.role) && envio.empresaId !== ctx.empresaId) {
      return NextResponse.json({ error: "sin_permisos" }, { status: 403 });
    }

    return NextResponse.json({
      id: envio.id,
      estado: envio.estado,
      order_id: envio.order_id,
    });
  } catch (error) {
    console.error("Error al obtener envío:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

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
    const { estado } = body;

    const estadosValidos = ["EN PREPARACIÓN", "EN CAMINO", "ENTREGADO"];

    if (!estado) {
      return NextResponse.json({ error: "El campo estado es requerido" }, { status: 400 });
    }

    if (!estadosValidos.includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const envioActual = await prisma.envio.findUnique({ where: { id } });
    if (!envioActual) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
    }

    if (ctx.tipo === "usuario" && !esAdmin(ctx.role) && envioActual.empresaId !== ctx.empresaId) {
      return NextResponse.json({ error: "sin_permisos" }, { status: 403 });
    }

    const envio = await prisma.$transaction(async (tx) => {
      const updated = await tx.envio.update({
        where: { id },
        data: { estado },
      });

      await tx.eventoDeEnvio.create({
        data: {
          envio_id: updated.id,
          descripcion: `Estado actualizado a: ${estado}`,
        },
      });

      return updated;
    });

    notificarEstadoEnvio({
      ordenId: envio.order_id,
      codigoSeguimiento: envio.codigo_seguimiento,
      estado: envio.estado,
    }).catch((err) => console.error("Error notificando a Buyer:", err));

    if (estado === "ENTREGADO") {
      notificarEntregaExitosa(
        envio.order_id,
        envio.codigo_seguimiento,
        new Date()
      ).catch((err) => console.error("Error notificando a Payments:", err));
    }

    return NextResponse.json({
      id: envio.id,
      estado: envio.estado,
      order_id: envio.order_id,
    });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    return NextResponse.json(
      { error: "Error interno", details: String(error) },
      { status: 500 }
    );
  }
}