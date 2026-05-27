import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const fastShip = await prisma.empresa.create({
    data: {
      nombre: "FastShip Logistics",
    },
  });

  const groovy = await prisma.empresa.create({
    data: {
      nombre: "Groovy Express",
    },
  });

  const urban = await prisma.empresa.create({
    data: {
      nombre: "Urban Delivery",
    },
  });


  await prisma.usuario.createMany({
    data: [

      // ADMIN GLOBAL
      {
        id_clerk: "user_3Dx6Z8xLItQFGSViwJkorIGTpEk",
        mail: "franciscouyua@gmail.com",
        role: "ADMIN",
        empresaId: fastShip.id,
      },

      // OPERADOR FASTSHIP
      {
        id_clerk: "user_3E2YATmnKT9g1Z2SKTnQIlFpO2V",
        mail: "uyuafrancisco151@gmail.com",
        role: "OPERADOR",
        empresaId: fastShip.id,
      },

      // OPERADOR GROOVY
      {
        id_clerk: "operator_groovy",
        mail: "operador2@groovy.com",
        role: "OPERADOR",
        empresaId: groovy.id,
      },

      // OPERADOR URBAN
      {
        id_clerk: "operator_urban",
        mail: "operador3@urban.com",
        role: "OPERADOR",
        empresaId: urban.id,
      },
    ],
  });


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

  const direccion3 = await prisma.direccion.create({
    data: {
      calle: "Belgrano 456",
      ciudad: "Rosario",
      provincia: "Santa Fe",
      cod_postal: "2000",
      pais: "Argentina",
    },
  });

  const direccion4 = await prisma.direccion.create({
    data: {
      calle: "Mitre 999",
      ciudad: "Mendoza",
      provincia: "Mendoza",
      cod_postal: "5500",
      pais: "Argentina",
    },
  });

  const envio1 = await prisma.envio.create({
    data: {
      order_id: "ORD-1001",
      seller_id: 10,
      buyer_id: 200,
      direccion_id: direccion1.id,
      estado: "EN CAMINO",
      empresaId: fastShip.id,
    },
  });

  const envio2 = await prisma.envio.create({
    data: {
      order_id: "ORD-1002",
      seller_id: 11,
      buyer_id: 201,
      direccion_id: direccion2.id,
      estado: "ENTREGADO",
      empresaId: groovy.id,
    },
  });

  const envio3 = await prisma.envio.create({
    data: {
      order_id: "ORD-1003",
      seller_id: 12,
      buyer_id: 202,
      direccion_id: direccion3.id,
      estado: "EN PREPARACIÓN",
      empresaId: urban.id,
    },
  });

  const envio4 = await prisma.envio.create({
    data: {
      order_id: "ORD-1004",
      seller_id: 13,
      buyer_id: 203,
      direccion_id: direccion4.id,
      estado: "EN CAMINO",
      empresaId: fastShip.id,
    },
  });

  await prisma.eventoDeEnvio.createMany({
    data: [

      // ENVIO 1
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

      // ENVIO 2
      {
        envio_id: envio2.id,
        descripcion: "Pedido confirmado",
      },
      {
        envio_id: envio2.id,
        descripcion: "Pedido entregado exitosamente",
      },

      // ENVIO 3
      {
        envio_id: envio3.id,
        descripcion: "Esperando preparación",
      },

      // ENVIO 4
      {
        envio_id: envio4.id,
        descripcion: "Retirado por operador logístico",
      },
      {
        envio_id: envio4.id,
        descripcion: "En tránsito a destino",
      },
    ],
  });

  console.log("Seed completado correctamente");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });