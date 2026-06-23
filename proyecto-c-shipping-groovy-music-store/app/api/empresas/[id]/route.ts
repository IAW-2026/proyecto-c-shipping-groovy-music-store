import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requiereAuth } from "@/lib/auth-api";

// Detalle de una empresa
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  try {
    const { id } = await params;

    const empresa = await prisma.empresa.findUnique({
      where: { id },
      include: {
        _count: { select: { envios: true, usuarios: true } },
        usuarios: {
          select: { id_clerk: true, mail: true, role: true },
        },
      },
    });

    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      id: empresa.id,
      nombre: empresa.nombre,
      totalEnvios: empresa._count.envios,
      totalUsuarios: empresa._count.usuarios,
      usuarios: empresa.usuarios,
    });
  } catch (error) {
    console.error("Error al obtener empresa:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Editar empresa
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  const ctx = authResult.ctx;
  if (ctx.tipo === "usuario" && ctx.role !== "ADMIN") {
    return NextResponse.json({ error: "sin_permisos" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.nombre || body.nombre.trim() === "") {
      return NextResponse.json(
        { error: "campo_requerido", mensaje: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const empresa = await prisma.empresa.update({
      where: { id },
      data: { nombre: body.nombre.trim() },
    });

    return NextResponse.json(empresa);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }
    console.error("Error al editar empresa:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Eliminar empresa (solo si no tiene envíos ni usuarios)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  const ctx = authResult.ctx;
  if (ctx.tipo === "usuario" && ctx.role !== "ADMIN") {
    return NextResponse.json({ error: "sin_permisos" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const empresa = await prisma.empresa.findUnique({
      where: { id },
      include: { _count: { select: { envios: true, usuarios: true } } },
    });

    if (!empresa) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    if (empresa._count.envios > 0 || empresa._count.usuarios > 0) {
      return NextResponse.json(
        {
          error: "empresa_en_uso",
          mensaje: `No se puede eliminar: tiene ${empresa._count.envios} envíos y ${empresa._count.usuarios} usuarios asignados`,
        },
        { status: 409 }
      );
    }

    await prisma.empresa.delete({ where: { id } });
    return NextResponse.json({ estado: "eliminada", id });
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
