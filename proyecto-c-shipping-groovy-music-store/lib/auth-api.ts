import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { verifyToken } from "@clerk/backend";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export type ContextoAuth =
  | { tipo: "servicio"; appId: string }
  | { tipo: "usuario"; userId: string; role: string; empresaId: string | null };

// Valida auth de 3 formas: JWT S2S, JWT Clerk (Bearer), o cookie de Clerk (browser).
export async function autenticarRequest(req: NextRequest): Promise<ContextoAuth | null> {
  const header = req.headers.get("authorization");

  if (header?.startsWith("Bearer ")) {
    const token = header.slice(7);

    // 1) JWT de servicio (S2S entre apps)
    try {
      const payloadS2S = jwt.verify(token, process.env.SHIPPING_JWT_SECRET!) as { appId: string };
      return { tipo: "servicio", appId: payloadS2S.appId || "unknown" };
    } catch {}

    // 2) JWT de Clerk enviado como Bearer (Control Plane / Analytics)
    try {
      const payloadClerk = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      const usuario = await prisma.usuario.findUnique({
        where: { id_clerk: payloadClerk.sub },
      });
      if (usuario) {
        return {
          tipo: "usuario",
          userId: usuario.id_clerk,
          role: usuario.role,
          empresaId: usuario.empresaId,
        };
      }
    } catch {}
  }

  // 3) Cookie de sesión de Clerk (llamadas desde el browser / UI propia)
  try {
    const { userId } = await auth();
    if (userId) {
      const usuario = await prisma.usuario.findUnique({
        where: { id_clerk: userId },
      });
      if (usuario) {
        return {
          tipo: "usuario",
          userId: usuario.id_clerk,
          role: usuario.role,
          empresaId: usuario.empresaId,
        };
      }
    }
  } catch {}

  return null;
}

// Atajo para usar en los endpoints
export async function requiereAuth(req: NextRequest) {
  const ctx = await autenticarRequest(req);
  if (!ctx) {
    return { error: { error: "no_autorizado", mensaje: "Token inválido o ausente" }, status: 401 as const };
  }
  return { ctx };
}