"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/auth";

// Elimina un envío y todos sus eventos asociados de la base de datos.
// Borra primero los eventos para evitar errores de foreign key.
// Revalida la página para reflejar el cambio en el panel.
export async function eliminarEnvio(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "No autenticado." };
  }
  if (user.role !== "ADMIN") {
    return { success: false, error: "Solo un administrador puede eliminar envíos." };
  }

  try {
    await prisma.eventoDeEnvio.deleteMany({
      where: { envio_id: id },
    });

    await prisma.envio.delete({
      where: { id },
    });

    revalidatePath("/shipping");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar envío:", error);
    return { success: false, error: "No se pudo borrar el envío en la base de datos." };
  }
}

// Crea un nuevo envío a partir de los datos del formulario.
// Valida todos los campos del lado del servidor antes de tocar la base de datos.
// Genera el código de seguimiento automáticamente siguiendo el formato GRV-XXXX,
// y el order_id como UUID aleatorio.
// Crea primero la dirección y luego el envío vinculado a ella.
export async function crearEnvio(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, errores: { general: "No autenticado." } };
  }
  if (user.role !== "ADMIN") {
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

  // Validación del lado del servidor — todos los campos son obligatorios
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
    // Busca el último envío para calcular el siguiente número de código de seguimiento
    const ultimoEnvio = await prisma.envio.findFirst({
      orderBy: { codigo_seguimiento: "desc" },
    });

    const ultimoNumero = ultimoEnvio
      ? parseInt(ultimoEnvio.codigo_seguimiento.split("-")[1]) + 1
      : 1;

    // Formato GRV-0001, GRV-0002, etc.
    const codigo_seguimiento = `GRV-${String(ultimoNumero).padStart(4, "0")}`;

    // Crea la dirección primero ya que el envío la referencia por ID
    const direccion = await prisma.direccion.create({
      data: { calle, ciudad, provincia, cod_postal, pais },
    });

    await prisma.envio.create({
      data: {
        order_id: randomUUID(),
        codigo_seguimiento,
        seller_id,
        buyer_id,
        direccion_id: direccion.id,
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