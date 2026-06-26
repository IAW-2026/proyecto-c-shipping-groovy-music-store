"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { esAdmin } from "@/lib/roles";

// Elimina un envío y todos sus eventos asociados
export async function eliminarEnvio(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "No autenticado." };
  }
  if (!esAdmin(user.role)) {
    return { success: false, error: "Solo un administrador puede eliminar envíos." };
  }

  try {
    await prisma.eventoDeEnvio.deleteMany({ where: { envio_id: id } });
    await prisma.envio.delete({ where: { id } });
    revalidatePath("/shipping");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar envío:", error);
    return { success: false, error: "No se pudo borrar el envío en la base de datos." };
  }
}

// Crea un nuevo envío desde el formulario interno del admin
export async function crearEnvio(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, errores: { general: "No autenticado." } };
  }
  if (!esAdmin(user.role)) {
    return { success: false, errores: { general: "Solo un administrador puede crear envíos." } };
  }

  const seller_id = formData.get("seller_id") as string;
  const buyer_id = formData.get("buyer_id") as string;
  const calle = formData.get("calle") as string;
  const ciudad = formData.get("ciudad") as string;
  const provincia = formData.get("provincia") as string;
  const cod_postal = formData.get("cod_postal") as string;
  const pais = formData.get("pais") as string;
  const empresaId = formData.get("empresaId") as string;
  const fecha_raw = formData.get("fecha_entrega_estimada") as string;

  const errores: Record<string, string> = {};
  if (!seller_id) errores.seller_id = "El ID del vendedor es requerido";
  if (!buyer_id) errores.buyer_id = "El ID del comprador es requerido";
  if (!calle) errores.calle = "La calle es requerida";
  if (!ciudad) errores.ciudad = "La ciudad es requerida";
  if (!provincia) errores.provincia = "La provincia es requerida";
  if (!cod_postal) errores.cod_postal = "El código postal es requerido";
  if (!empresaId) errores.empresaId = "La empresa es requerida";
  if (!fecha_raw) errores.fecha_entrega_estimada = "La fecha de entrega estimada es requerida";

  if (Object.keys(errores).length > 0) {
    return { success: false, errores };
  }

  try {
    const ultimoEnvio = await prisma.envio.findFirst({
      orderBy: { codigo_seguimiento: "desc" },
    });

    const ultimoNumero = ultimoEnvio
      ? parseInt(ultimoEnvio.codigo_seguimiento.split("-")[1]) + 1
      : 1;

    const codigo_seguimiento = `GRV-${String(ultimoNumero).padStart(4, "0")}`;

    const direccionDestino = await prisma.direccion.create({
      data: { calle, ciudad, provincia, cod_postal, pais: pais || "Argentina" },
    });

    await prisma.envio.create({
      data: {
        order_id: randomUUID(),
        codigo_seguimiento,
        seller_id,
        buyer_id,
        direccion_destino_id: direccionDestino.id,
        estado: "EN PREPARACIÓN",
        empresaId,
        fecha_entrega_estimada: new Date(fecha_raw),
      },
    });

    revalidatePath("/shipping");
    return { success: true };
  } catch (error) {
    console.error("Error al crear envío:", error);
    return { success: false, errores: { general: "Error al crear el envío" } };
  }
}