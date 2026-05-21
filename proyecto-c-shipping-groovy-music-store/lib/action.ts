"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateEnvioEstado(
  envioId: number,
  nuevoEstado: string
) {

  await prisma.envio.update({
    where: {
      id: envioId,
    },
    data: {
      estado: nuevoEstado,
    },
  });

  revalidatePath("/shipping");
}