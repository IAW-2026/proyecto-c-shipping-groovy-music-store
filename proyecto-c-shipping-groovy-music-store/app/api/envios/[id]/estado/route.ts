import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "no_autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const envio = await prisma.envio.findUnique({
      where: { id },
    });

    if (!envio) {
      return NextResponse.json(
        { error: "Envío no encontrado" },
        { status: 404 }
      );
    }

    if (user.role !== "ADMIN" && envio.empresaId !== user.empresaId) {
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
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "no_autenticado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { estado } = body;

    const estadosValidos = ["EN PREPARACIÓN", "EN CAMINO", "ENTREGADO"];

    if (!estado) {
      return NextResponse.json(
        { error: "El campo estado es requerido" },
        { status: 400 }
      );
    }

    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    const envioActual = await prisma.envio.findUnique({ where: { id } });
    if (!envioActual) {
      return NextResponse.json(
        { error: "Envío no encontrado" },
        { status: 404 }
      );
    }

    // Un operador solo puede cambiar envíos de su empresa; admin todos
    if (user.role !== "ADMIN" && envioActual.empresaId !== user.empresaId) {
      return NextResponse.json({ error: "sin_permisos" }, { status: 403 });
    }

    const envio = await prisma.envio.update({
      where: { id },
      data: { estado },
    });

    await prisma.eventoDeEnvio.create({
      data: {
        envio_id: envio.id,
        descripcion: `Estado actualizado a: ${estado}`,
      },
    });

    /* Se documenta hasta la etapa 3 donde hay que unir las apis
    // Si el envío fue entregado, notifica a Payments para liberar los fondos
    if (estado === "ENTREGADO") {
      try {
        const res = await fetch(
          `${process.env.PAYMENTS_API_URL}/api/payments/delivery-confirmation`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ordenId: envio.order_id,
              codigoSeguimiento: envio.codigo_seguimiento,
              estado: "entregado",
              entregadoEn: new Date().toISOString(),
            }),
          }
        );
        const data = await res.json();
        console.log("Respuesta de Payments:", data);
      } catch (error) {
        // Si Payments falla, no interrumpimos el flujo principal
        console.error("No se pudo notificar a Payments:", error);
      }
    }
    */

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
