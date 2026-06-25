import { NextRequest, NextResponse } from "next/server";
import { requiereAuth } from "@/lib/auth-api";
import { asignarEmpresaPorCp } from "@/lib/asignarEmpresa";

function calcularCosto(peso: number, distancia: number): number {
  const BASE = 1500;
  const POR_KG = 1000;
  const POR_KM = 2;
  return Math.round(BASE + peso * POR_KG + distancia * POR_KM);
}

function calcularFechaEstimada(distancia: number): string {
  const dias = distancia < 500 ? 3 : distancia < 1000 ? 5 : 7;
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString();
}

function estimarDistancia(origenCp: number, destinoCp: number): number {
  return Math.abs(origenCp - destinoCp) * 0.5;
}

// Calcular costo de envío (Buyer → Shipping, endpoint #9)
export async function GET(req: NextRequest) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  const params = req.nextUrl.searchParams;
  const origenCp = params.get("origen_cp");
  const destinoCp = params.get("destino_cp");
  const peso = params.get("peso");

  if (!origenCp || !destinoCp || !peso) {
    return NextResponse.json(
      { error: "parametros_requeridos", mensaje: "origen_cp, destino_cp y peso son requeridos" },
      { status: 400 }
    );
  }

  const distancia = estimarDistancia(Number(origenCp), Number(destinoCp));
  const empresa = await asignarEmpresaPorCp(destinoCp);

  return NextResponse.json({
    costo: calcularCosto(Number(peso), distancia),
    fechaEntregaEstimada: calcularFechaEstimada(distancia),
    empresa: empresa ? { id: empresa.id, nombre: empresa.nombre } : null,
  });
}