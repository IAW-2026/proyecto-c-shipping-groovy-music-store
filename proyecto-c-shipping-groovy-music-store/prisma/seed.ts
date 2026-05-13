import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  // EMPRESAS
  const empresa1 = await prisma.empresa.create({
    data: {
      nombre: "FastShip Logistics",
    },
  });

  const empresa2 = await prisma.empresa.create({
    data: {
      nombre: "Groovy Express",
    },
  });

  // USUARIOS
  await prisma.usuario.createMany({
    data: [
      {
        id_clerk: "user_1",
        mail: "operador1@groovy.com",
        empresaId: empresa1.id,
      },
      {
        id_clerk: "user_2",
        mail: "operador2@groovy.com",
        empresaId: empresa2.id,
      },
    ],
  });

  // DIRECCIONES
  const direccion1 = await prisma.direccion.create({
    data: {
      calle: "Av. Siempre Viva 742",
      ciudad: "Buenos Aires",
      provincia: "Buenos Aires",
      cod_postal: "1000",
      pais: "Argentina",
    },
  });

  const direccion2 = await prisma.direccion.create({
    data: {
      calle: "San Martín 123",
      ciudad: "Córdoba",
      provincia: "Córdoba",
      cod_postal: "5000",
      pais: "Argentina",
    },
  });

  // ENVIOS
  const envio1 = await prisma.envio.create({
    data: {
      order_id: "ORD-1001",
      seller_id: 10,
      buyer_id: 200,
      direccion_id: direccion1.id,
      estado: "EN_CAMINO",
      empresaId: empresa1.id,
    },
  });

  const envio2 = await prisma.envio.create({
    data: {
      order_id: "ORD-1002",
      seller_id: 11,
      buyer_id: 201,
      direccion_id: direccion2.id,
      estado: "ENTREGADO",
      empresaId: empresa2.id,
    },
  });

  // EVENTOS
  await prisma.eventoDeEnvio.createMany({
    data: [
      {
        envio_id: envio1.id,
        descripcion: "Pedido recibido en depósito",
      },
      {
        envio_id: envio1.id,
        descripcion: "Envío despachado",
      },
      {
        envio_id: envio1.id,
        descripcion: "Repartidor en camino",
      },
      {
        envio_id: envio2.id,
        descripcion: "Pedido recibido",
      },
      {
        envio_id: envio2.id,
        descripcion: "Pedido entregado exitosamente",
      },
    ],
  });

  console.log("Seed completado");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });