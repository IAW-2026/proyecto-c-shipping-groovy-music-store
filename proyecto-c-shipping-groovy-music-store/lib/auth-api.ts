// lib/auth-api.ts
import { NextRequest } from "next/server";
import { verifyToken } from "@clerk/backend";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export type ContextoAuth =
  | { tipo: "servicio"; appId: string }
  | { tipo: "usuario"; userId: string; role: string; empresaId: string | null };

export async function autenticarRequest(req: NextRequest): Promise<ContextoAuth | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice(7);

  // 1) Intentar validar como JWT de Servicio a Servicio (S2S)
  // Usamos TU secreto (SHIPPING_JWT_SECRET) porque están intentando entrar a TU app.
  try {
    const payloadS2S = jwt.verify(token, process.env.SHIPPING_JWT_SECRET!) as { appId: string };
    return { tipo: "servicio", appId: payloadS2S.appId || "unknown" };
  } catch (e) {
    // Si falla, no retornamos null todavía, probamos si es un token de Clerk
  }

  // 2) Intentar validar como JWT de Clerk (Usuarios / Control Plane)
  try {
    const payloadClerk = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    const usuario = await prisma.usuario.findUnique({
      where: { id_clerk: payloadClerk.sub },
    });
    if (!usuario) return null;
    
    return {
      tipo: "usuario",
      userId: usuario.id_clerk,
      role: usuario.role,
      empresaId: usuario.empresaId,
    };
  } catch {
    return null;
  }
}

// Atajo para usar en los endpoints
export async function requiereAuth(req: NextRequest) {
  const ctx = await autenticarRequest(req);
  if (!ctx) {
    return { error: { error: "no_autorizado", mensaje: "Token inválido o ausente" }, status: 401 };
  }
  return { ctx };
}