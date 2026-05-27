import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/auth";
import StatsEnvios from "@/app/componentes/StatsEnvios";
import PanelFiltroEnvios from "@/app/componentes/PanelFiltrosEnvio";
import { normalizarEstado } from "@/lib/utils";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = user?.role === "ADMIN";

  const enviosRaw = await prisma.envio.findMany({
    where: isAdmin ? {} : { empresaId: user?.empresaId },
    include: {
      direccion: true,
      empresa: true,
      eventos: true,
    },
    orderBy: {
      id: "desc",
    }
  });

  const envios = enviosRaw.map((envio) => ({
    ...envio,
    estado: normalizarEstado(envio.estado),
  }));

  const entregados = envios.filter((e) => e.estado === "ENTREGADO").length;
  const enCamino = envios.filter((e) => e.estado === "EN CAMINO").length;

  return (
    <main className="min-h-screen bg-background text-foreground font-sans pb-24">
      {/* ── HEADER ── */}
      <header className="bg-primary text-primary-foreground py-4 px-6 md:px-10 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-normal tracking-[0.3em] uppercase">
            G r o o v y
          </h1>
          <span className="hidden md:inline-block text-primary-foreground/70 text-sm font-medium tracking-widest border-l border-primary-foreground/30 pl-4 ml-2 uppercase">
            Shipping
          </span>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 pl-4 border-l border-primary-foreground/30">
            <div className="hidden sm:flex items-center text-xs font-bold bg-primary-foreground/20 px-3 py-1 rounded-full uppercase tracking-wider">
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

        {/* STATS (Ocupando todo el ancho ahora) */}
        <div className="mb-10">
          <StatsEnvios
            totalInicial={envios.length}
            enCaminoInicial={enCamino}
            entregadosInicial={entregados}
          />
        </div>

        {/* PANEL CON BUSCADOR EN TIEMPO REAL INTEGRADO */}
        <PanelFiltroEnvios enviosIniciales={envios} />
      </div>
    </main>
  );
}