import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { estado } = await req.json();

    const estadosValidos = ["EN PREPARACIÓN", "EN CAMINO", "ENTREGADO"];
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

const envio = await prisma.envio.update({
  where: { id: Number(params.id) },  // 👈
  data: { estado },
});

    return NextResponse.json(envio);
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}