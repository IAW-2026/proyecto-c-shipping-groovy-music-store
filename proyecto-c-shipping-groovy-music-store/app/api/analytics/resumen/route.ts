import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requiereAuth } from "@/lib/auth-api";

// Resumen global de envíos para Analytics Dashboard
export async function GET(req: NextRequest) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  try {
    const hoy = new Date();

    const [total, enPreparacion, enCamino, entregados, envios] = await Promise.all([
      prisma.envio.count(),
      prisma.envio.count({ where: { estado: "EN PREPARACIÓN" } }),
      prisma.envio.count({ where: { estado: "EN CAMINO" } }),
      prisma.envio.count({ where: { estado: "ENTREGADO" } }),
      prisma.envio.findMany({
        where: {
          estado: { not: "ENTREGADO" },
          fecha_entrega_estimada: { lt: hoy },
        },
        select: { id: true },
      }),
    ]);

    const demorados = envios.length;

    // Tiempo promedio de entrega (solo entregados que tengan eventos)
    const entregadosConEventos = await prisma.envio.findMany({
      where: { estado: "ENTREGADO" },
      include: {
        eventos: {
          orderBy: { timestamp: "asc" },
          take: 1, 
        },
      },
    });

    let tiempoPromedioHoras = 0;
    if (entregadosConEventos.length > 0) {
      const tiempos = entregadosConEventos
        .filter((e) => e.eventos.length > 0)
        .map((e) => {
          const creacion = e.eventos[0].timestamp.getTime();
          const ahora = hoy.getTime();
          return (ahora - creacion) / (1000 * 60 * 60);
        });
      if (tiempos.length > 0) {
        tiempoPromedioHoras = Math.round(
          tiempos.reduce((a, b) => a + b, 0) / tiempos.length
        );
      }
    }

    // Envíos por empresa
    const empresas = await prisma.empresa.findMany({
      include: { _count: { select: { envios: true } } },
      orderBy: { nombre: "asc" },
    });

    const enviosPorEmpresa = empresas.map((e) => ({
      empresaId: e.id,
      nombre: e.nombre,
      total: e._count.envios,
    }));

    return NextResponse.json({
      total,
      porEstado: {
        enPreparacion,
        enCamino,
        entregados,
      },
      demorados,
      tiempoPromedioHoras,
      porcentajeEntregados: total === 0 ? 0 : Math.round((entregados / total) * 100),
      enviosPorEmpresa,
    });
  } catch (error) {
    console.error("Error en analytics/resumen:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
