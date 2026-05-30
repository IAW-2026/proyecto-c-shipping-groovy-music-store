import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const envio = await prisma.envio.findUnique({
      where: {
        id: id,
      },
    });

    if (!envio) {
      return NextResponse.json(
        { error: "Envío no encontrado" },
        { status: 404 }
      );
    }

    //Devolvemos solo lo necesario
    return NextResponse.json({
      id: envio.id,
      estado: envio.estado,
      order_id: envio.order_id,
    });

  } catch (error) {
    console.error("Error al obtener envío:", error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("PATCH /api/envios/[id]/estado - ID:", id);

    const body = await req.json();
    const { estado } = body;

    console.log("Estado recibido:", estado);

    const estadosValidos = [
      "EN PREPARACIÓN",
      "EN CAMINO",
      "ENTREGADO",
    ];

    if (!estadosValidos.includes(estado)) {
      console.error("Estado inválido:", estado);

      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    const envioId = id;

    console.log("Actualizando envío ID:", envioId);

    const envio = await prisma.envio.update({
      where: {
        id: envioId,
      },
      data: {
        estado,
      },
    });

    console.log("Envío actualizado:", envio);

    return NextResponse.json({
      id: envio.id,
      estado: envio.estado,
      order_id: envio.order_id,
    });

  } catch (error) {
    console.error("Error al actualizar estado:", error);

    return NextResponse.json(
      {
        error: "Error interno",
        details: String(error),
      },
      { status: 500 }
    );
  }
}