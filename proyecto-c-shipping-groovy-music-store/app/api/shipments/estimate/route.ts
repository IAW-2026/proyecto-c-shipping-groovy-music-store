import { NextResponse } from "next/server";

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);

  const origen = searchParams.get("origen_cp");
  const destino = searchParams.get("destino_cp");
  const peso = Number(searchParams.get("peso"));

  if (!origen || !destino || !peso) {
    return NextResponse.json(
      {
        error: "Faltan parámetros",
      },
      {
        status: 400,
      }
    );
  }

  // Lógica simple inventada
  let costoBase = 2400;

  // peso
  costoBase += peso * 8000;

  // distancia fake
  if (origen !== destino) {
    costoBase += 500;
  }

  // entrega estimada
  const diasEntrega =
    origen === destino ? 1 : 3;

  return NextResponse.json({
    costo: Math.round(costoBase),
    fechaEntregaEstimada: diasEntrega,
  });
}