import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requiereAuth } from "@/lib/auth-api";

// Serie temporal de envíos creados por día para gráficos de Analytics
export async function GET(req: NextRequest) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  try {
    const params = req.nextUrl.searchParams;
    const desde = params.get("desde");
    const hasta = params.get("hasta");

    // Por defecto últimos 30 días
    const fechaHasta = hasta ? new Date(hasta) : new Date();
    const fechaDesde = desde
      ? new Date(desde)
      : new Date(fechaHasta.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Traemos los primeros eventos de cada envío (= fecha de creación)
    const envios = await prisma.envio.findMany({
      where: {
        eventos: {
          some: {
            timestamp: {
              gte: fechaDesde,
              lte: fechaHasta,
            },
          },
        },
      },
      include: {
        eventos: {
          orderBy: { timestamp: "asc" },
          take: 1,
        },
      },
    });

    // Agrupar por día
    const porDia: Record<string, number> = {};
    for (const envio of envios) {
      if (envio.eventos.length === 0) continue;
      const fecha = envio.eventos[0].timestamp.toISOString().split("T")[0];
      porDia[fecha] = (porDia[fecha] || 0) + 1;
    }

    // Rellenar días sin envíos con 0
    const resultado: { fecha: string; cantidad: number }[] = [];
    const cursor = new Date(fechaDesde);
    while (cursor <= fechaHasta) {
      const key = cursor.toISOString().split("T")[0];
      resultado.push({ fecha: key, cantidad: porDia[key] || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return NextResponse.json({
      desde: fechaDesde.toISOString(),
      hasta: fechaHasta.toISOString(),
      datos: resultado,
    });
  } catch (error) {
    console.error("Error en analytics/envios-por-dia:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
