// app/api/shipments/estimate/route.ts
import { NextRequest, NextResponse } from "next/server";

// Tabla de zonas por código postal (mock — reemplazá con tu lógica real)
function calcularZona(cp: string): number {
  const prefijo = parseInt(cp.slice(0, 1));
  if (prefijo <= 2) return 1; // AMBA
  if (prefijo <= 5) return 2; // Centro
  return 3;                   // Resto del país
}

function calcularCosto(zonaOrigen: number, zonaDestino: number, peso: number): number {
  const BASE = 1500;
  const POR_KG = 800;
  const POR_ZONA = 600;
  const diferencia = Math.abs(zonaOrigen - zonaDestino);
  return Math.round(BASE + peso * POR_KG + diferencia * POR_ZONA);
}

function calcularDias(zonaOrigen: number, zonaDestino: number): number {
  const diferencia = Math.abs(zonaOrigen - zonaDestino);
  return diferencia === 0 ? 1 : diferencia === 1 ? 3 : 5;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const origen_cp  = searchParams.get("origen_cp")  ?? "";
  const destino_cp = searchParams.get("destino_cp") ?? "";
  const peso       = parseFloat(searchParams.get("peso") ?? "0");

  if (!origen_cp || !destino_cp || !peso) {
    return NextResponse.json(
      { error: "origen_cp, destino_cp y peso son requeridos" },
      { status: 400 }
    );
  }

  const zonaO = calcularZona(origen_cp);
  const zonaD = calcularZona(destino_cp);

  return NextResponse.json({
    costo: calcularCosto(zonaO, zonaD, peso),
    fechaEntregaEstimada: calcularDias(zonaO, zonaD), // días hábiles
  });
}