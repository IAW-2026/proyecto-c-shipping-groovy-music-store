import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requiereAuth } from "@/lib/auth-api";

// Listar operadores con su empresa asignada
export async function GET(req: NextRequest) {
  const authResult = await requiereAuth(req);
  if ("error" in authResult) {
    return NextResponse.json(authResult.error, { status: authResult.status });
  }

  try {
    const params = req.nextUrl.searchParams;
    const empresaId = params.get("empresaId");
    const role = params.get("role");

    const where: any = {};
    if (empresaId) where.empresaId = empresaId;
    if (role) where.role = role;

    const usuarios = await prisma.usuario.findMany({
      where,
      include: {
        empresa: { select: { id: true, nombre: true } },
      },
      orderBy: { mail: "asc" },
    });

    return NextResponse.json({
      datos: usuarios.map((u) => ({
        id_clerk: u.id_clerk,
        mail: u.mail,
        role: u.role,
        empresa: {
          id: u.empresa.id,
          nombre: u.empresa.nombre,
        },
      })),
    });
  } catch (error) {
    console.error("Error al listar operadores:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
