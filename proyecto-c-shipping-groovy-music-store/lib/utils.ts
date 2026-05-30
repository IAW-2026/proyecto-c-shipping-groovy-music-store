export const ESTADOS_VALIDOS = ["EN PREPARACIÓN", "EN CAMINO", "ENTREGADO"] as const;

export type EstadoEnvio = typeof ESTADOS_VALIDOS[number];

export function normalizarEstado(estado: string): EstadoEnvio {
  if (!estado) return "EN PREPARACIÓN";
  const normalizado = estado.toUpperCase().replace(/_/g, " ");
  if (normalizado === "EN PREPARACION" || normalizado === "EN PREPARACIÓN") {
    return "EN PREPARACIÓN";
  }
  if (normalizado === "EN CAMINO") {
    return "EN CAMINO";
  }
  if (normalizado === "ENTREGADO") {
    return "ENTREGADO";
  }
  return "EN PREPARACIÓN";
}
