import jwt from "jsonwebtoken";

export async function notificarEstadoEnvio(data: {
  ordenId: string;
  codigoSeguimiento: string;
  estado: string;
}) {
  try {
    const tokenS2S = jwt.sign(
      { appId: "shipping_app" }, 
      process.env.BUYER_JWT_SECRET!, 
      { expiresIn: "5m" } 
    );

    const res = await fetch(`${process.env.BUYER_API_URL}/api/orders/shipping-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenS2S}`,
      },
      body: JSON.stringify({
        order_id: data.ordenId, 
        codigo_seguimiento: data.codigoSeguimiento, 
        estado: data.estado, 
      }),
    });
    
    if (!res.ok) {
        const errorText = await res.text();
        console.error("La Buyer App rechazó la notificación. Código:", res.status, "Detalle:", errorText);
    } else {
        console.log("¡Notificación enviada a Buyer con éxito!");
    }
  } catch (err) {
    console.error("No se pudo notificar a Buyer (Error de red):", err);
  }
}
