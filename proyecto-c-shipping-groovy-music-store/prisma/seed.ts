import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  const fastShip = await prisma.empresa.create({
    data: { nombre: "FastShip Logistics" },
  });

  const groovy = await prisma.empresa.create({
    data: { nombre: "Groovy Express" },
  });

  const urban = await prisma.empresa.create({
    data: { nombre: "Urban Delivery" },
  });

  await prisma.usuario.createMany({
    data: [
      {
        id_clerk: "user_3EVKE9kMVXfMJwBhN1kgNYaj8qi",
        mail: "shippingadmin@gmail.com",
        role: "ADMIN",
        empresaId: fastShip.id,
      },
      {
        id_clerk: "user_3Dx6Z8xLItQFGSViwJkorIGTpEk",
        mail: "franciscouyua11@gmail.com",
        role: "ADMIN",
        empresaId: fastShip.id,
      },
      {
        id_clerk: "user_3E2YATmnKT9g1Z2SKTnQIlFpO2V",
        mail: "uyuafrancisco151@gmail.com",
        role: "OPERADOR",
        empresaId: fastShip.id,
      },
      {
        id_clerk: "user_3EVJ89cP7CJgPS8CoPBNJnuMID0",
        mail: "operadorfastShip@gmail.com",
        role: "OPERADOR",
        empresaId: fastShip.id,
      },
      {
        id_clerk: "user_3EVBatBt4ywVQ6SBH5CmpOFFzfB",
        mail: "operadorgroovy24@gmail.com",
        role: "OPERADOR",
        empresaId: groovy.id,
      },
      {
        id_clerk: "user_3EVK4YOxXbaCPauRYbzvrQ3vBTJ",
        mail: "operadorUrban@urban.com",
        role: "OPERADOR",
        empresaId: urban.id,
      },
    ],
  });

  const direccion1 = await prisma.direccion.create({
    data: { calle: "Av. Siempre Viva 742", ciudad: "Buenos Aires", provincia: "Buenos Aires", cod_postal: "1000", pais: "Argentina" },
  });
  const direccion2 = await prisma.direccion.create({
    data: { calle: "San Martín 123", ciudad: "Córdoba", provincia: "Córdoba", cod_postal: "5000", pais: "Argentina" },
  });
  const direccion3 = await prisma.direccion.create({
    data: { calle: "Belgrano 456", ciudad: "Rosario", provincia: "Santa Fe", cod_postal: "2000", pais: "Argentina" },
  });
  const direccion4 = await prisma.direccion.create({
    data: { calle: "Mitre 999", ciudad: "Mendoza", provincia: "Mendoza", cod_postal: "5500", pais: "Argentina" },
  });
  const direccion5 = await prisma.direccion.create({
    data: { calle: "Sarmiento 44", ciudad: "San Miguel de Tucumán", provincia: "Tucumán", cod_postal: "4000", pais: "Argentina" },
  });
  const direccion6 = await prisma.direccion.create({
    data: { calle: "Moreno 876", ciudad: "La Plata", provincia: "Buenos Aires", cod_postal: "1900", pais: "Argentina" },
  });
  const direccion7 = await prisma.direccion.create({
    data: { calle: "Rivadavia 1010", ciudad: "Mar del Plata", provincia: "Buenos Aires", cod_postal: "7600", pais: "Argentina" },
  });

  // EN CAMINO → fecha estimada en 2-3 días
  const envio1 = await prisma.envio.create({
    data: {
      codigo_seguimiento: "GRV-0001",
      order_id: "550e8400-e29b-41d4-a716-446655440001",
      seller_id: "user_seller_a1b2c3d4",
      buyer_id: "user_buyer_x9y8z7w6",
      direccion_id: direccion1.id,
      estado: "EN CAMINO",
      empresaId: fastShip.id,
      fecha_entrega_estimada: new Date("2026-06-02T00:00:00Z"),
    },
  });

  // ENTREGADO → fecha estimada en el pasado
  const envio2 = await prisma.envio.create({
    data: {
      codigo_seguimiento: "GRV-0002",
      order_id: "550e8400-e29b-41d4-a716-446655440002",
      seller_id: "user_seller_e5f6g7h8",
      buyer_id: "user_buyer_v5u4t3s2",
      direccion_id: direccion2.id,
      estado: "ENTREGADO",
      empresaId: groovy.id,
      fecha_entrega_estimada: new Date("2026-05-20T00:00:00Z"),
    },
  });

  // EN PREPARACIÓN → fecha estimada en 6-7 días
  const envio3 = await prisma.envio.create({
    data: {
      codigo_seguimiento: "GRV-0003",
      order_id: "550e8400-e29b-41d4-a716-446655440003",
      seller_id: "user_seller_i9j0k1l2",
      buyer_id: "user_buyer_r1q2p3o4",
      direccion_id: direccion3.id,
      estado: "EN PREPARACIÓN",
      empresaId: urban.id,
      fecha_entrega_estimada: new Date("2026-06-07T00:00:00Z"),
    },
  });

  const envio4 = await prisma.envio.create({
    data: {
      codigo_seguimiento: "GRV-0004",
      order_id: "550e8400-e29b-41d4-a716-446655440004",
      seller_id: "user_seller_m3n4o5p6",
      buyer_id: "user_buyer_m5n6o7p8",
      direccion_id: direccion4.id,
      estado: "EN CAMINO",
      empresaId: fastShip.id,
      fecha_entrega_estimada: new Date("2026-06-03T00:00:00Z"),
    },
  });

  const envio5 = await prisma.envio.create({
    data: {
      codigo_seguimiento: "GRV-0005",
      order_id: "550e8400-e29b-41d4-a716-446655440005",
      seller_id: "user_seller_q1w2e3r4",
      buyer_id: "user_buyer_a1s2d3f4",
      direccion_id: direccion5.id,
      estado: "ENTREGADO",
      empresaId: groovy.id,
      fecha_entrega_estimada: new Date("2026-05-15T00:00:00Z"),
    },
  });

  const envio6 = await prisma.envio.create({
    data: {
      codigo_seguimiento: "GRV-0006",
      order_id: "550e8400-e29b-41d4-a716-446655440006",
      seller_id: "user_seller_z1x2c3v4",
      buyer_id: "user_buyer_p1o2i3u4",
      direccion_id: direccion6.id,
      estado: "EN PREPARACIÓN",
      empresaId: urban.id,
      fecha_entrega_estimada: new Date("2026-06-08T00:00:00Z"),
    },
  });

  const envio7 = await prisma.envio.create({
    data: {
      codigo_seguimiento: "GRV-0007",
      order_id: "550e8400-e29b-41d4-a716-446655440007",
      seller_id: "user_seller_t1y2u3i4",
      buyer_id: "user_buyer_l1k2j3h4",
      direccion_id: direccion7.id,
      estado: "EN CAMINO",
      empresaId: fastShip.id,
      fecha_entrega_estimada: new Date("2026-06-04T00:00:00Z"),
    },
  });

  const envio8 = await prisma.envio.create({
    data: {
      codigo_seguimiento: "GRV-0008",
      order_id: "550e8400-e29b-41d4-a716-446655440008",
      seller_id: "user_seller_m1n2b3v4",
      buyer_id: "user_buyer_g1f2d3s4",
      direccion_id: direccion1.id,
      estado: "ENTREGADO",
      empresaId: fastShip.id,
      fecha_entrega_estimada: new Date("2026-05-25T00:00:00Z"),
    },
  });

  const envio9 = await prisma.envio.create({
    data: {
      codigo_seguimiento: "GRV-0009",
      order_id: "550e8400-e29b-41d4-a716-446655440009",
      seller_id: "user_seller_r1t2y3u4",
      buyer_id: "user_buyer_m1n2b3v4",
      direccion_id: direccion2.id,
      estado: "EN PREPARACIÓN",
      empresaId: groovy.id,
      fecha_entrega_estimada: new Date("2026-06-09T00:00:00Z"),
    },
  });

  const envio10 = await prisma.envio.create({
    data: {
      codigo_seguimiento: "GRV-0010",
      order_id: "550e8400-e29b-41d4-a716-446655440010",
      seller_id: "user_seller_c1x2z3a4",
      buyer_id: "user_buyer_q1w2e3r4",
      direccion_id: direccion3.id,
      estado: "EN CAMINO",
      empresaId: urban.id,
      fecha_entrega_estimada: new Date("2026-06-05T00:00:00Z"),
    },
  });

  await prisma.eventoDeEnvio.createMany({
    data: [
      { envio_id: envio1.id, descripcion: "Pedido recibido en depósito" },
      { envio_id: envio1.id, descripcion: "Envío despachado" },
      { envio_id: envio1.id, descripcion: "Repartidor en camino" },

      { envio_id: envio2.id, descripcion: "Pedido confirmado" },
      { envio_id: envio2.id, descripcion: "En tránsito a destino" },
      { envio_id: envio2.id, descripcion: "Pedido entregado exitosamente" },

      { envio_id: envio3.id, descripcion: "Esperando preparación" },

      { envio_id: envio4.id, descripcion: "Retirado por operador logístico" },
      { envio_id: envio4.id, descripcion: "En tránsito a destino" },

      { envio_id: envio5.id, descripcion: "Empaquetado y rotulado" },
      { envio_id: envio5.id, descripcion: "Despachado a sucursal destino" },
      { envio_id: envio5.id, descripcion: "Pedido entregado exitosamente" },

      { envio_id: envio6.id, descripcion: "Orden recibida" },
      { envio_id: envio6.id, descripcion: "Esperando recolección del vendedor" },

      { envio_id: envio7.id, descripcion: "Ingreso a planta troncal" },
      { envio_id: envio7.id, descripcion: "En viaje a ciudad destino" },

      { envio_id: envio8.id, descripcion: "Preparado" },
      { envio_id: envio8.id, descripcion: "Visita a domicilio" },
      { envio_id: envio8.id, descripcion: "Entregado a un adulto" },

      { envio_id: envio9.id, descripcion: "Pago confirmado, en preparación" },

      { envio_id: envio10.id, descripcion: "Recibido en centro logístico" },
      { envio_id: envio10.id, descripcion: "En camino al domicilio del comprador" },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });