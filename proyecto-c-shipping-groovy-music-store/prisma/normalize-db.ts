import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const envios = await prisma.envio.findMany();
  let count = 0;
  for (const envio of envios) {
    let nuevoEstado = envio.estado;
    if (envio.estado === "EN_CAMINO") {
      nuevoEstado = "EN CAMINO";
    } else if (envio.estado === "EN_PREPARACION") {
      nuevoEstado = "EN PREPARACIÓN";
    }
    if (nuevoEstado !== envio.estado) {
      await prisma.envio.update({
        where: { id: envio.id },
        data: { estado: nuevoEstado },
      });
      console.log(`Envio ${envio.order_id}: ${envio.estado} -> ${nuevoEstado}`);
      count++;
    }
  }
  console.log(`Database states normalized successfully. Updated ${count} records.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
