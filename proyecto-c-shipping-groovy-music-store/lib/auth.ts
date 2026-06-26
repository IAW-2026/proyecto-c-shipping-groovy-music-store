import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { extraerRol, extraerEmpresaId, type Rol } from "@/lib/roles";

export type UsuarioActual = {
  id_clerk: string;
  mail: string | null;
  role: Rol;
  empresaId: string | null;
};

// El middleware ya validó que el usuario está logueado y tiene rol.
// Acá solo armamos el objeto con los datos que necesitan las páginas.
export async function getCurrentUser(): Promise<UsuarioActual | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const role = extraerRol(sessionClaims);
  const empresaIdClerk = extraerEmpresaId(sessionClaims);

  // Buscamos en DB para mail y empresaId si no vino en Clerk
  const usuarioDb = await prisma.usuario.findUnique({
    where: { id_clerk: userId },
  });

  return {
    id_clerk: userId,
    mail: usuarioDb?.mail ?? null,
    role,
    empresaId: empresaIdClerk ?? usuarioDb?.empresaId ?? null,
  };
}