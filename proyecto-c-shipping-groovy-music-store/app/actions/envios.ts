"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const ESTADOS = ["EN PREPARACIÓN", "EN CAMINO", "ENTREGADO"] as const;
type Estado = typeof ESTADOS[number];

export async function cambiarEstadoEnvio(envioId: string, nuevoEstado: Estado) {
  await prisma.envio.update({
    where: { id: envioId },
    data: { estado: nuevoEstado },
  });

  await prisma.eventoDeEnvio.create({
    data: {
      envio_id: envioId,
      descripcion: `Estado actualizado a: ${nuevoEstado}`,
    },
  });

  revalidatePath("/");
}