"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateEnvioEstado(
  envioId: string,
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