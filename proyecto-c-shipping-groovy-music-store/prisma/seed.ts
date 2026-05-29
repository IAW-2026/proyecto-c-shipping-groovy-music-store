import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. (OPCIONAL PERO RECOMENDADO) Limpiar la base de datos antes de poblarla
  // Esto evita errores de duplicación si corrés el seed varias veces
  await prisma.eventoDeEnvio.deleteMany();
  await prisma.envio.deleteMany();
  await prisma.direccion.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.empresa.deleteMany();

  // 2. Crear Empresas (Prisma les asigna un UUID automáticamente)
  const fastShip = await prisma.empresa.create({
    data: { nombre: "FastShip Logistics" },
  });

  const groovy = await prisma.empresa.create({
    data: { nombre: "Groovy Express" },
  });

  const urban = await prisma.empresa.create({
    data: { nombre: "Urban Delivery" },
  });

  // 3. Crear Usuarios (Toman el UUID dinámico de las empresas)
  await prisma.usuario.createMany({
    data: [
      { // ADMIN GLOBAL
        id_clerk: "user_3Dx6Z8xLItQFGSViwJkorIGTpEk",
        mail: "franciscouyua@gmail.com",
        role: "ADMIN",
        empresaId: fastShip.id, 
      },
      { // OPERADOR FASTSHIP
        id_clerk: "user_3E2YATmnKT9g1Z2SKTnQIlFpO2V",
        mail: "uyuafrancisco151@gmail.com",
        role: "OPERADOR",
        empresaId: fastShip.id,
      },
      { // OPERADOR GROOVY
        id_clerk: "operator_groovy",
        mail: "operador2@groovy.com",
        role: "OPERADOR",
        empresaId: groovy.id,
      },
      { // OPERADOR URBAN
        id_clerk: "operator_urban",
        mail: "operador3@urban.com",
        role: "OPERADOR",
        empresaId: urban.id,
      },
    ],
  });

  // 4. Crear Direcciones
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

  // 5. Crear Envíos (Ahora los seller_id y buyer_id simulan ser UUIDs/Clerk IDs externos)
  const envio1 = await prisma.envio.create({
    data: {
      order_id: "550e8400-e29b-41d4-a716-446655440001", // Simulación de UUID de Orden
      seller_id: "user_seller_a1b2c3d4",                // Simulación ID externo
      buyer_id: "user_buyer_x9y8z7w6",                  // Simulación ID externo
      direccion_id: direccion1.id,
      estado: "EN CAMINO",                              // Nota: Asegurate de usar el estado tal como lo espera tu frontend ("EN CAMINO" o "EN_CAMINO")
      empresaId: fastShip.id,
    },
  });

  const envio2 = await prisma.envio.create({
    data: {
      order_id: "550e8400-e29b-41d4-a716-446655440002",
      seller_id: "user_seller_e5f6g7h8",
      buyer_id: "user_buyer_v5u4t3s2",
      direccion_id: direccion2.id,
      estado: "ENTREGADO",
      empresaId: groovy.id,
    },
  });

  const envio3 = await prisma.envio.create({
    data: {
      order_id: "550e8400-e29b-41d4-a716-446655440003",
      seller_id: "user_seller_i9j0k1l2",
      buyer_id: "user_buyer_r1q2p3o4",
      direccion_id: direccion3.id,
      estado: "EN PREPARACIÓN",
      empresaId: urban.id,
    },
  });

  const envio4 = await prisma.envio.create({
    data: {
      order_id: "550e8400-e29b-41d4-a716-446655440004",
      seller_id: "user_seller_m3n4o5p6",
      buyer_id: "user_buyer_m5n6o7p8",
      direccion_id: direccion4.id,
      estado: "EN CAMINO",
      empresaId: fastShip.id,
    },
  });

  // 6. Crear Eventos
  await prisma.eventoDeEnvio.createMany({
    data: [
      { envio_id: envio1.id, descripcion: "Pedido recibido en depósito" },
      { envio_id: envio1.id, descripcion: "Envío despachado" },
      { envio_id: envio1.id, descripcion: "Repartidor en camino" },
      { envio_id: envio2.id, descripcion: "Pedido confirmado" },
      { envio_id: envio2.id, descripcion: "Pedido entregado exitosamente" },
      { envio_id: envio3.id, descripcion: "Esperando preparación" },
      { envio_id: envio4.id, descripcion: "Retirado por operador logístico" },
      { envio_id: envio4.id, descripcion: "En tránsito a destino" },
    ],
  });

  console.log("Seed completado correctamente con UUIDs ✅");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });