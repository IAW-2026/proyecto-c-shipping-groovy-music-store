import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requiereAuth } from "@/lib/auth-api";

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

// Consultar envío por orderId (Buyer → Shipping, endpoint #8)
export async function GET(req: NextRequest) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  const orderId = req.nextUrl.searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json(
      { error: "orden_requerida", mensaje: "El parámetro orderId es requerido" },
      { status: 400 }
    );
  }

  const envio = await prisma.envio.findUnique({
    where: { order_id: orderId },
    include: {
      empresa: true,
      direccionDestino: true,
      direccionOrigen: true,
    },
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
    estado: envio.estado.toLowerCase(),
    fechaEntregaEstimada: envio.fecha_entrega_estimada,
    empresa: {
      id: envio.empresa.id,
      nombre: envio.empresa.nombre,
    },
    direccionDestino: {
      calle: envio.direccionDestino.calle,
      ciudad: envio.direccionDestino.ciudad,
      provincia: envio.direccionDestino.provincia,
      cod_postal: envio.direccionDestino.cod_postal,
      pais: envio.direccionDestino.pais,
    },
    // Opcional: solo presente si el seller la mandó
    ...(envio.direccionOrigen && {
      direccionOrigen: {
        calle: envio.direccionOrigen.calle,
        ciudad: envio.direccionOrigen.ciudad,
        provincia: envio.direccionOrigen.provincia,
        cod_postal: envio.direccionOrigen.cod_postal,
        pais: envio.direccionOrigen.pais,
      },
    }),
  });
}

// Crear envío (Seller → Shipping, endpoint #10)
export async function POST(req: NextRequest) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  const body = await req.json();
  const { order_id, seller_id, buyer_id, direccionDestino, direccionOrigen } = body;

  if (!order_id || !seller_id || !buyer_id || !direccionDestino) {
    return NextResponse.json(
      {
        error: "campos_requeridos",
        mensaje: "Faltan campos obligatorios (order_id, seller_id, buyer_id, direccionDestino)",
      },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.findFirst();
      if (!empresa) throw new Error("sin_empresa");

      // Crear dirección destino (obligatoria)
      const dirDestino = await tx.direccion.create({
        data: {
          calle: direccionDestino.calle ?? "Sin especificar",
          ciudad: direccionDestino.ciudad ?? "Sin especificar",
          provincia: direccionDestino.provincia ?? "Sin especificar",
          cod_postal: direccionDestino.cod_postal ?? "0000",
          pais: direccionDestino.pais ?? "Argentina",
        },
      });

      // Crear dirección origen (opcional)
      let dirOrigenId: string | undefined;
      if (direccionOrigen) {
        const dirOrigen = await tx.direccion.create({
          data: {
            calle: direccionOrigen.calle ?? "Sin especificar",
            ciudad: direccionOrigen.ciudad ?? "Sin especificar",
            provincia: direccionOrigen.provincia ?? "Sin especificar",
            cod_postal: direccionOrigen.cod_postal ?? "0000",
            pais: direccionOrigen.pais ?? "Argentina",
          },
        });
        dirOrigenId = dirOrigen.id;
      }

      const envio = await tx.envio.create({
        data: {
          order_id,
          seller_id,
          buyer_id,
          codigo_seguimiento: generarCodigoSeguimiento(),
          fecha_entrega_estimada: calcularFechaEstimada(),
          estado: "EN PREPARACIÓN",
          direccion_destino_id: dirDestino.id,
          ...(dirOrigenId && { direccion_origen_id: dirOrigenId }),
          empresaId: empresa.id,
        },
      });

      await tx.eventoDeEnvio.create({
        data: {
          envio_id: envio.id,
          descripcion: "Envío creado - EN PREPARACIÓN",
        },
      });

      return envio;
    });

    return NextResponse.json(
      {
        envioId: result.id,
        codigoSeguimiento: result.codigo_seguimiento,
        estado: "creado",
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "sin_empresa") {
      return NextResponse.json(
        { error: "sin_empresa", mensaje: "No hay empresas registradas" },
        { status: 500 }
      );
    }
    console.error("Error al crear envío:", error);
    return NextResponse.json(
      { error: "error_interno", mensaje: "No se pudo crear el envío" },
      { status: 500 }
    );
  }
}
