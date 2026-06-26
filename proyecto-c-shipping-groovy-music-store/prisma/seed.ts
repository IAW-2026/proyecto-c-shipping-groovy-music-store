import { PrismaClient } from "@prisma/client";
import { SELLER_ID, DIRECCIONES, ORDENES, ENVIO_IDS } from "./contrato-datos";

const prisma = new PrismaClient();

// estado_global del contrato -> Envio.estado real de Shipping. Solo existen
// estos 3: Seller no crea el Envio hasta que despacha (estado "ENVIADO" de su
// lado), así que las órdenes anteriores a eso ni aparecen acá.
const MAPA_ENVIO_ESTADO: Record<string, string> = {
  ENVIADO_EN_PREPARACION: "EN PREPARACIÓN",
  EN_CAMINO: "EN CAMINO",
  ENTREGADO: "ENTREGADO",
};

// Plantillas de eventos según el estado final del envío — mismo estilo
// narrativo que ya usaba tu seed anterior.
const EVENTOS_POR_ESTADO: Record<string, string[]> = {
  "EN PREPARACIÓN": ["Pedido recibido en depósito"],
  "EN CAMINO": ["Pedido recibido en depósito", "Envío despachado", "Repartidor en camino"],
  "ENTREGADO": ["Pedido recibido en depósito", "Envío despachado", "Repartidor en camino", "Pedido entregado exitosamente"],
};

async function main() {
  console.log(" Iniciando seed de Shipping...");

  await prisma.eventoDeEnvio.deleteMany();
  await prisma.envio.deleteMany();
  await prisma.direccion.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.empresa.deleteMany();

  console.log("✓ Tablas limpiadas");

  // ─── Empresas (mismos nombres que ya usa el contrato en empresa_envio) ──
  const fastShip = await prisma.empresa.create({ data: { nombre: "FastShip Logistics" } });
  const groovy = await prisma.empresa.create({ data: { nombre: "Groovy Express" } });
  const urban = await prisma.empresa.create({ data: { nombre: "Urban Delivery" } });

  const empresaPorNombre: Record<string, string> = {
    "FastShip Logistics": fastShip.id,
    "Groovy Express": groovy.id,
    "Urban Delivery": urban.id,
  };

  console.log("✓ 3 empresas creadas");

  // ─── Usuarios (staff de Shipping — no son parte del contrato compartido,
  // son cuentas Clerk propias de esta app, igual que las tenías) ──────────
  await prisma.usuario.createMany({
    data: [
      { id_clerk: "user_3EVKE9kMVXfMJwBhN1kgNYaj8qi", mail: "shippingadmin@gmail.com", role: "ADMIN", empresaId: fastShip.id },
      { id_clerk: "user_3Dx6Z8xLItQFGSViwJkorIGTpEk", mail: "franciscouyua11@gmail.com", role: "ADMIN", empresaId: fastShip.id },
      { id_clerk: "user_3E2YATmnKT9g1Z2SKTnQIlFpO2V", mail: "uyuafrancisco151@gmail.com", role: "OPERADOR", empresaId: fastShip.id },
      { id_clerk: "user_3EVJ89cP7CJgPS8CoPBNJnuMID0", mail: "operadorfastShip@gmail.com", role: "OPERADOR", empresaId: fastShip.id },
      { id_clerk: "user_3EVBatBt4ywVQ6SBH5CmpOFFzfB", mail: "operadorgroovy24@gmail.com", role: "OPERADOR", empresaId: groovy.id },
      { id_clerk: "user_3EVK4YOxXbaCPauRYbzvrQ3vBTJ", mail: "operadorUrban@urban.com", role: "OPERADOR", empresaId: urban.id },
    ],
  });

  console.log("✓ 6 usuarios de Shipping creados");

  // ─── Envíos + dirección + eventos, solo para las órdenes que el contrato
  // marca con un ENVIO_IDS no nulo (las que Seller llegó a despachar) ──────
  let creados = 0;
  let contador = 1;

  for (const orden of ORDENES) {
    const envioId = ENVIO_IDS[orden.id];
    if (!envioId) continue;

    const estado = MAPA_ENVIO_ESTADO[orden.estado_global];
    const dir = DIRECCIONES[orden.buyer_id];

    // Cada despacho real crea su propia Direccion (así lo hace /api/shipments
    // hoy: nunca reutiliza una existente, aunque sea el mismo comprador).
    const direccion = await prisma.direccion.create({
      data: {
        calle: dir.calle,
        ciudad: dir.ciudad,
        provincia: dir.provincia,
        cod_postal: dir.cod_postal,
        pais: dir.pais,
      },
    });

    // Estimamos 5 días de tránsito desde que se hizo la orden. Para entregados
    // (órdenes viejas) esto cae en el pasado; para en camino/en preparación
    // (órdenes recientes) cae a futuro — exactamente como debería verse.
    const fechaEntregaEstimada = new Date(
      Date.now() - (orden.dias_atras - 5) * 86_400_000
    );

    const envio = await prisma.envio.create({
      data: {
        id: envioId,
        order_id: orden.id,
        codigo_seguimiento: `GRV-${String(contador).padStart(4, "0")}`,
        fecha_entrega_estimada: fechaEntregaEstimada,
        seller_id: SELLER_ID,
        buyer_id: orden.buyer_id,
        direccion_destino_id: direccion.id,
        estado,
        empresaId: empresaPorNombre[orden.empresa_envio],
      },
    });
    contador++;
    creados++;

    // Eventos repartidos entre el día después de la orden y "ahora" (o la
    // fecha estimada, si ya fue entregado).
    const descripciones = EVENTOS_POR_ESTADO[estado];
    const inicio = Date.now() - (orden.dias_atras - 1) * 86_400_000;
    const fin = estado === "ENTREGADO" ? fechaEntregaEstimada.getTime() : Date.now();

    await prisma.eventoDeEnvio.createMany({
      data: descripciones.map((descripcion, i) => ({
        envio_id: envio.id,
        descripcion,
        timestamp: new Date(
          descripciones.length === 1
            ? inicio
            : inicio + (i * (fin - inicio)) / (descripciones.length - 1)
        ),
      })),
    });
  }

  console.log(`✓ ${creados} envíos creados (de ${ORDENES.length} órdenes en el contrato)`);

  // ─── Resumen ──────────────────────────────────────────────────────────
  const porEstado = await prisma.envio.groupBy({ by: ["estado"], _count: { _all: true } });
  const porEmpresa = await prisma.envio.groupBy({ by: ["empresaId"], _count: { _all: true } });
  const totalEventos = await prisma.eventoDeEnvio.count();

  console.log("");
  console.log("📊 Resumen del seed:");
  console.log(`   Empresas: 3 | Usuarios: 6`);
  console.log(`   Envíos:   ${creados}`);
  for (const g of porEstado) console.log(`     - ${g.estado}: ${g._count._all}`);
  console.log(`   Eventos de envío: ${totalEventos}`);
  console.log("");
  console.log("✅ Seed completado.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });