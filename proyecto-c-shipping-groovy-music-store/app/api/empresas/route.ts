import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requiereAuth } from "@/lib/auth-api";

// Listar todas las empresas con conteo de envíos
export async function GET(req: NextRequest) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  try {
    const empresas = await prisma.empresa.findMany({
      orderBy: { nombre: "asc" },
      include: {
        _count: { select: { envios: true, usuarios: true } },
      },
    });

    return NextResponse.json({
      datos: empresas.map((e) => ({
        id: e.id,
        nombre: e.nombre,
        totalEnvios: e._count.envios,
        totalUsuarios: e._count.usuarios,
      })),
    });
  } catch (error) {
    console.error("Error al listar empresas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Crear empresa nueva
export async function POST(req: NextRequest) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  const ctx = authResult.ctx;
  if (ctx.tipo === "usuario" && ctx.role !== "ADMIN") {
    return NextResponse.json({ error: "sin_permisos" }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.nombre || body.nombre.trim() === "") {
      return NextResponse.json(
        { error: "campo_requerido", mensaje: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const empresa = await prisma.empresa.create({
      data: { nombre: body.nombre.trim() },
    });

    return NextResponse.json(empresa, { status: 201 });
  } catch (error) {
    console.error("Error al crear empresa:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
