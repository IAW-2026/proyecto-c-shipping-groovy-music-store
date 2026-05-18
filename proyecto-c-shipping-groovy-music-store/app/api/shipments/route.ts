import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);

  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json(
      {
        error: "orderId es requerido",
      },
      {
        status: 400,
      }
    );
  }

  const envio = await prisma.envio.findFirst({
    where: {
      order_id: orderId,
    },
  });

  if (!envio) {
    return NextResponse.json(
      {
        error: "Envío no encontrado",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json({
    id: envio.order_id,
    codigoSeguimiento: `TRK-${envio.id}`,
    estado: envio.estado,
    fechaEntregaEstimada: new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    ).toISOString(),
  });
}