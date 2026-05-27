"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function eliminarEnvio(id: number) {
  try {
    // 1. Eliminamos primero los eventos/historial asociados a ese paquete
    await prisma.eventoDeEnvio.deleteMany({
      where: { envio_id: id },
    });

    // 2. Ahora sí, borramos el envío principal
    await prisma.envio.delete({
      where: { id },
    });

    // Le avisamos a Next.js que refresque los datos del servidor
    revalidatePath("/shipping");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar envío:", error);
    return { success: false, error: "No se pudo borrar el envío en la base de datos." };
  }
}