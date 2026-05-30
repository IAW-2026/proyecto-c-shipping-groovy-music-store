import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generarCodigoSeguimiento(): string {
  const timestamp = Date.now().toString().slice(-6);
  return `GRV-${timestamp}`;
}

function calcularFechaEstimada(): Date {
  const dias = Math.floor(Math.random() * 5) + 3;
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json(
      { error: "orden_requerida", mensaje: "El parámetro orderId es requerido" },
      { status: 400 }
    );
  }

  const envio = await prisma.envio.findUnique({
    where: { order_id: orderId },
  });

  if (!envio) {
    return NextResponse.json(
      { error: "envio_no_encontrado", mensaje: "No se encontró un envío para esa orden" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: envio.order_id,
    codigoSeguimiento: envio.codigo_seguimiento,
    estado: envio.estado,
    fechaEntregaEstimada: envio.fecha_entrega_estimada,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, seller_id, buyer_id, direccionDestino } = body;

  if (!order_id || !seller_id || !buyer_id || !direccionDestino) {
    return NextResponse.json(
      { error: "campos_requeridos", mensaje: "Faltan campos obligatorios" },
      { status: 400 }
    );
  }

  const empresa = await prisma.empresa.findFirst();
  if (!empresa) {
    return NextResponse.json(
      { error: "sin_empresa", mensaje: "No hay empresas registradas" },
      { status: 500 }
    );
  }

  const direccion = await prisma.direccion.create({
    data: {
      calle: direccionDestino.calle ?? "Sin especificar",
      ciudad: direccionDestino.ciudad,
      provincia: direccionDestino.provincia ?? "Sin especificar",
      cod_postal: direccionDestino.cod_postal ?? "0000",
      pais: "Argentina",
    },
  });

  const envio = await prisma.envio.create({
    data: {
      order_id,
      seller_id,
      buyer_id,
      codigo_seguimiento: generarCodigoSeguimiento(),
      fecha_entrega_estimada: calcularFechaEstimada(),
      estado: "EN PREPARACIÓN",
      direccion_id: direccion.id,
      empresaId: empresa.id,
    },
  });

  return NextResponse.json({
    envioId: envio.id,
    codigoSeguimiento: envio.codigo_seguimiento,
    estado: envio.estado,
  }, { status: 201 });
}