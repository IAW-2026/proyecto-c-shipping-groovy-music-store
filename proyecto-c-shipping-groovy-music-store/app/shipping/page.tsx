import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/auth";
import StatsEnvios from "@/app/componentes/StatsEnvios";
import PanelFiltroEnvios from "@/app/componentes/PanelFiltrosEnvio";
import { normalizarEstado } from "@/lib/utils";

export default async function Home(props: {
  searchParams: Promise<{ query?: string; page?: string; estado?: string }>;
}) {
  const searchParams = await props.searchParams;

  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = user?.role === "ADMIN";

  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const estadoFiltro = searchParams?.estado || "";
  const ITEMS_POR_PAGINA = 5;

  const baseWhere = {
    ...(isAdmin ? {} : { empresaId: user?.empresaId }),
    ...(query ? { codigo_seguimiento: { contains: query, mode: "insensitive" as const } } : {}),
    ...(estadoFiltro ? { estado: estadoFiltro } : {}),
  };

  const enviosRaw = await prisma.envio.findMany({
    where: baseWhere,
    include: {
      direccion: true,
      empresa: true,
      eventos: true,
    },
    orderBy: {
      id: "desc",
    },
    skip: (currentPage - 1) * ITEMS_POR_PAGINA,
    take: ITEMS_POR_PAGINA,
  });

  const envios = enviosRaw.map((envio) => ({
    ...envio,
    estado: normalizarEstado(envio.estado),
  }));

  const totalEnviosBuscados = await prisma.envio.count({ where: baseWhere });
  const totalPages = Math.ceil(totalEnviosBuscados / ITEMS_POR_PAGINA);

  const statsWhere = isAdmin ? {} : { empresaId: user?.empresaId };
  const totalParaStats = await prisma.envio.count({ where: statsWhere });
  const entregados = await prisma.envio.count({ where: { ...statsWhere, estado: "ENTREGADO" } });
  const enCamino = await prisma.envio.count({ where: { ...statsWhere, estado: "EN CAMINO" } });

  return (
    <main className="min-h-screen bg-background text-foreground font-sans pb-24">
      {/* ── HEADER ── */}
<header className="bg-primary text-primary-foreground py-4 px-6 md:px-10 flex items-center justify-between shadow-md">
  <div className="flex items-center gap-4">
    <h1
      className="leading-none tracking-[0.08em] uppercase text-primary-foreground"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 300,
        fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
      }}
    >
      Groovy
    </h1>
    <span
      className="hidden md:inline-block text-primary-foreground/70 text-xs font-medium tracking-[0.3em] border-l border-primary-foreground/30 pl-4 ml-2 uppercase"
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      Shipping
    </span>
  </div>

  <div className="flex items-center gap-3 pl-4 border-l border-primary-foreground/30">
    <div
      className="hidden sm:flex items-center text-xs font-semibold bg-primary-foreground/20 px-3 py-1 rounded-full uppercase tracking-wider"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {isAdmin ? "Admin" : "Operador"}
    </div>
    <UserButton
      appearance={{
        elements: {
          avatarBox: "w-9 h-9 border-2 border-primary-foreground/50",
        },
      }}
    />
  </div>
</header>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-12">
        {/* TÍTULO */}
        <div className="mb-10">
          <h2 className="text-4xl md:text-5xl font-medium text-foreground mb-3">
            Panel Operativo
          </h2>
          <p className="text-muted-foreground text-lg">
            ¡Hola! Mirá el estado actual de las rutas y paquetes asignados.
          </p>
          <div className="w-16 h-1 bg-primary mt-6" />
        </div>

        {/* STATS */}
        <div className="mb-10">
          <StatsEnvios
            totalInicial={totalParaStats}
            enCaminoInicial={enCamino}
            entregadosInicial={entregados}
          />
        </div>

        {/* PANEL */}
        <PanelFiltroEnvios
          enviosIniciales={envios}
          totalPages={totalPages}
          currentPage={currentPage}
          estadoActivo={estadoFiltro}
        />
      </div>
    </main>
  );
}