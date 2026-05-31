import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/envios/[id]/estado
 *
 * Obtiene el estado actual de un envío por su ID.
 * Devuelve solo los campos necesarios: id, estado y order_id.
 *
 * @param req - Objeto de solicitud HTTP de Next.js
 * @param params.id - UUID del envío a consultar
 *
 * @returns 200 - { id, estado, order_id }
 * @returns 404 - Si el envío no existe en la base de datos
 * @returns 500 - Si ocurre un error interno del servidor
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

/**
 * PATCH /api/envios/[id]/estado
 *
 * Actualiza el estado de un envío existente.
 * Solo acepta los valores: "EN PREPARACIÓN", "EN CAMINO" o "ENTREGADO".
 * Si el nuevo estado es "ENTREGADO", notifica al servicio de Payments
 * para liberar los fondos al vendedor.
 *
 * @param req - Objeto de solicitud HTTP de Next.js
 * @param params.id - UUID del envío a actualizar
 *
 * @body { estado: string } - Nuevo estado del envío
 *
 * @returns 200 - { id, estado, order_id } con los datos actualizados
 * @returns 400 - Si el campo estado falta o no es un valor válido
 * @returns 500 - Si ocurre un error interno del servidor
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { estado } = body;

    /** Valores permitidos para el campo estado */
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

    const envio = await prisma.envio.update({
      where: { id },
      data: { estado },
    });

    // Registra el cambio de estado en el historial del envío
    await prisma.eventoDeEnvio.create({
      data: {
        envio_id: envio.id,
        descripcion: estado,
      },
    });
/*Se documenta hasta la etapa 3 donde hay que unir las apis
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