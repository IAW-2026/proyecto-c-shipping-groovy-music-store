import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {

  const { userId } = await auth();

  if (!userId) return null;

  return prisma.usuario.findUnique({
    where: {
      id_clerk: userId,
    },
  });
}