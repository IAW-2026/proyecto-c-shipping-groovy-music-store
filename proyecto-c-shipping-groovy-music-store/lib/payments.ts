export async function notificarEntregaExitosa(
  ordenId: string,
  codigoSeguimiento: string,
  entregadoEn: Date
) {
  const paymentsUrl = process.env.PAYMENTS_API_URL;

  if (!paymentsUrl) {
    console.warn("Error: PAYMENTS_API_URL no configurada");
    return null;
  }

  try {
    const res = await fetch(`${paymentsUrl}/api/payments/delivery-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ordenId,
        codigoSeguimiento,
        estado: "entregado",
        entregadoEn: entregadoEn.toISOString(),
      }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error al notificar entrega a Payments:", error);
    return null;
  }
}