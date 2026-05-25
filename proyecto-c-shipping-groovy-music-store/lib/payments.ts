// lib/payments.ts
const PAYMENTS_BASE_URL = process.env.PAYMENTS_API_URL ?? "https://mock.payments.local";

export async function notificarEntregaAPayments(params: {
  ordenId: string;
  codigoSeguimiento: string;
  entregadoEn: Date;
}) {
  // ── MOCK: mientras Payments no esté disponible ──────────────────
  if (!process.env.PAYMENTS_API_URL) {
    console.log("[MOCK Payments] Notificación de entrega:", params);
    return { estado: "fondos_liberados", mensaje: "Fondos transferidos al vendedor (MOCK)" };
  }
  // ────────────────────────────────────────────────────────────────

  const res = await fetch(`${PAYMENTS_BASE_URL}/api/payments/delivery-confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ordenId:            params.ordenId,
      codigoSeguimiento:  params.codigoSeguimiento,
      estado:             "entregado",
      entregadoEn:        params.entregadoEn.toISOString(),
    }),
  });

  if (!res.ok) throw new Error(`Payments respondió ${res.status}`);
  return res.json();
}