import jwt from "jsonwebtoken";

// Notifica a Payments que un envío fue entregado para liberar fondos (endpoint #12)
export async function notificarEntregaExitosa(
  ordenId: string,
  codigoSeguimiento: string,
  entregadoEn: Date
) {
  const paymentsUrl = process.env.PAYMENTS_API_URL;
  if (!paymentsUrl) {
    console.warn("PAYMENTS_API_URL no configurada");
    return null;
  }

  try {
    const tokenS2S = jwt.sign(
      { appId: "shipping_app" },
      process.env.PAYMENTS_JWT_SECRET!,
      { expiresIn: "5m" }
    );

    const res = await fetch(`${paymentsUrl}/api/payments/delivery-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenS2S}`,
      },
      body: JSON.stringify({
        ordenId,
        codigoSeguimiento,
        estado: "entregado",
        entregadoEn: entregadoEn.toISOString(),
      }),
    });

    if (!res.ok) {
      console.error("Payments respondió", res.status);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Error al notificar entrega a Payments:", error);
    return null;
  }
}
