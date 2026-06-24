// lib/notificarBuyer.ts
import jwt from "jsonwebtoken";

export async function notificarEstadoEnvio(data: {
  ordenId: string;
  codigoSeguimiento: string;
  estado: string;
}) {
  try {
    // Firmamos un token diciendo "Soy Shipping", usando el secreto de Buyer
    const tokenS2S = jwt.sign(
      { appId: "shipping_app" }, 
      process.env.BUYER_JWT_SECRET!, 
      { expiresIn: "5m" } // El token expira rápido por seguridad
    );

    const res = await fetch(`${process.env.BUYER_API_URL}/api/orders/shipping-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenS2S}`,
      },
      body: JSON.stringify({
        ordenId: data.ordenId,
        codigoSeguimiento: data.codigoSeguimiento,
        estado: data.estado.toLowerCase(),
      }),
    });
    if (!res.ok) console.error("Buyer respondió", res.status);
  } catch (err) {
    console.error("No se pudo notificar a Buyer:", err);
  }
}