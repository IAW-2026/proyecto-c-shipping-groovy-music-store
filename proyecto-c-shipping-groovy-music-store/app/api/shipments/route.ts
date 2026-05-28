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
// Agregar en app/api/shipments/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  const {
    "order_id externo": order_id,
    seller_id,
    buyer_id,
    direccionDestino,
    peso,
  } = body;

  // Crea o reutiliza la dirección de destino
  const direccion = await prisma.direccion.create({
    data: {
      calle:      direccionDestino.calle      ?? "Sin especificar",
      ciudad:     direccionDestino.ciudad     ?? "Sin especificar",
      provincia:  direccionDestino.provincia  ?? "Sin especificar",
      cod_postal: direccionDestino.cod_postal ?? "0000",
      pais:       "Argentina",
    },
  });

  // Toma la primera empresa como operador por defecto
  // TODO: asignar la empresa correcta según lógica de negocio
  const empresa = await prisma.empresa.findFirst();
  if (!empresa) {
    return NextResponse.json(
      { error: "No hay empresas logísticas registradas" },
      { status: 500 }
    );
  }

const envio = await prisma.envio.create({
  data: {
    order_id,
    seller_id,
    buyer_id,
    estado: "En Preparación",
    empresaId: empresa.id,
    direccion_id: direccion.id,
    eventos: {
      create: {
        descripcion: "Envío creado. Esperando preparación del vendedor.",
      },
    },
  },
});

  const codigoSeguimiento = `TRK-${envio.id.toString().padStart(6, "0")}`;

  return NextResponse.json({
    envioId: envio.id,
    codigoSeguimiento,
    estado: "creado",
  }, { status: 201 });
}