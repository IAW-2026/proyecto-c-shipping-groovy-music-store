import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requiereAuth } from "@/lib/auth-api";
import { esAdmin } from "@/lib/roles";

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

// GET soporta 2 modos:
// - ?orderId=xxx → búsqueda por orden (Buyer, endpoint #8)
// - ?pagina=1&estado=&busqueda= → listado global con paginación (Control Plane)
export async function GET(req: NextRequest) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  const params = req.nextUrl.searchParams;
  const orderId = params.get("orderId");

  // ── Modo 1: búsqueda por orderId (Buyer → Shipping) ──
  if (orderId) {
    const envio = await prisma.envio.findUnique({
      where: { order_id: orderId },
      include: { empresa: true, direccionDestino: true, direccionOrigen: true },
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
      empresa: { id: envio.empresa.id, nombre: envio.empresa.nombre },
      direccionDestino: {
        calle: envio.direccionDestino.calle,
        ciudad: envio.direccionDestino.ciudad,
        provincia: envio.direccionDestino.provincia,
        cod_postal: envio.direccionDestino.cod_postal,
        pais: envio.direccionDestino.pais,
      },
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

  // ── Modo 2: listado global con paginación (Control Plane) ──
  const pagina = Math.max(1, Number(params.get("pagina")) || 1);
  const limite = Math.min(50, Math.max(1, Number(params.get("limite")) || 20));
  const estado = params.get("estado");
  const busqueda = params.get("busqueda");
  const empresaId = params.get("empresaId");

  const where: any = {};
  if (estado) where.estado = estado;
  if (empresaId) where.empresaId = empresaId;
  if (busqueda) {
    where.OR = [
      { codigo_seguimiento: { contains: busqueda, mode: "insensitive" } },
      { order_id: { contains: busqueda, mode: "insensitive" } },
      { seller_id: { contains: busqueda, mode: "insensitive" } },
      { buyer_id: { contains: busqueda, mode: "insensitive" } },
    ];
  }

  try {
    const [envios, total] = await Promise.all([
      prisma.envio.findMany({
        where,
        include: {
          empresa: { select: { id: true, nombre: true } },
          direccionDestino: true,
          direccionOrigen: true,
        },
        orderBy: { id: "desc" },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      prisma.envio.count({ where }),
    ]);

    return NextResponse.json({
      datos: envios.map((e) => ({
        id: e.id,
        order_id: e.order_id,
        codigo_seguimiento: e.codigo_seguimiento,
        estado: e.estado,
        seller_id: e.seller_id,
        buyer_id: e.buyer_id,
        fecha_entrega_estimada: e.fecha_entrega_estimada,
        empresa: e.empresa,
        direccionDestino: e.direccionDestino,
        ...(e.direccionOrigen && { direccionOrigen: e.direccionOrigen }),
      })),
      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite),
      },
    });
  } catch (error) {
    console.error("Error al listar envíos:", error);
    return NextResponse.json({ error: "error_interno", mensaje: "Error al listar envíos" }, { status: 500 });
  }
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
      { error: "campos_requeridos", mensaje: "Faltan campos obligatorios (order_id, seller_id, buyer_id, direccionDestino)" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const empresas = await tx.empresa.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, nombre: true },
      });
      if (empresas.length === 0) throw new Error("sin_empresa");

      const cpNumerico = parseInt(direccionDestino.cod_postal, 10) || 0;
      const empresa = empresas[cpNumerico % empresas.length];

      const dirDestino = await tx.direccion.create({
        data: {
          calle: direccionDestino.calle ?? "Sin especificar",
          ciudad: direccionDestino.ciudad ?? "Sin especificar",
          provincia: direccionDestino.provincia ?? "Sin especificar",
          cod_postal: direccionDestino.cod_postal ?? "0000",
          pais: direccionDestino.pais ?? "Argentina",
        },
      });

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
        data: { envio_id: envio.id, descripcion: "Envío creado - EN PREPARACIÓN" },
      });

      return envio;
    });

    return NextResponse.json(
      { envioId: result.id, codigoSeguimiento: result.codigo_seguimiento, estado: "creado" },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "sin_empresa") {
      return NextResponse.json({ error: "sin_empresa", mensaje: "No hay empresas registradas" }, { status: 500 });
    }
    console.error("Error al crear envío:", error);
    return NextResponse.json({ error: "error_interno", mensaje: "No se pudo crear el envío" }, { status: 500 });
  }
}