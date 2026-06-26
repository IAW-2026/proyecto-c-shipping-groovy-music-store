import jwt from "jsonwebtoken";

export async function notificarEstadoEnvio(data: {
  ordenId: string;
  codigoSeguimiento: string;
  estado: string;
}) {
  const BUYER_URL = process.env.BUYER_API_URL;
  if (!BUYER_URL) {
    console.error("[notificarEstadoEnvio] BUYER_API_URL no está definida");
    return;
  }

  const mapaEstados: Record<string, string> = {
    "EN PREPARACIÓN": "Pendiente de envio",
    "EN CAMINO": "En camino",
    "ENTREGADO": "Entregado",
  };

  const estadoMapeado = mapaEstados[data.estado];
  if (!estadoMapeado) {
    console.error(`[notificarEstadoEnvio] Estado sin mapeo: ${data.estado}`);
    return;
  }

  const tokenS2S = jwt.sign(
    { appId: "shipping_app" },
    process.env.BUYER_JWT_SECRET!,
    { expiresIn: "5m" }
  );

  const url = `${BUYER_URL}/api/orders/shipping-status`;
  console.log(`[notificarEstadoEnvio] POST ${url} | ordenId: ${data.ordenId} | estado: ${estadoMapeado}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tokenS2S}`,
    },
    body: JSON.stringify({
      ordenId: data.ordenId,
      estado: estadoMapeado,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    throw new Error(`Buyer respondió ${res.status}: ${body}`);
  }

  console.log(`[notificarEstadoEnvio] OK — orden ${data.ordenId} actualizada`);
}