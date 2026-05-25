import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/auth";
import StatsEnvios from "@/app/componentes/StatsEnvios";
import PanelFiltroEnvios from "@/app/componentes/PanelFiltrosEnvio"; // ¡Importado!
import { Truck, Search } from "lucide-react";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = user?.role === "ADMIN";

  // Buscamos los datos limpios de la BD
  const envios = await prisma.envio.findMany({
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
          <Search
            size={20}
            className="text-primary-foreground hover:text-primary-foreground/80 cursor-pointer transition-colors"
          />
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

      {/* Contenido Principal */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-12">
        {/* ── TÍTULO ── */}
        <div className="mb-10">
          <h2 className="text-4xl md:text-5xl font-medium text-foreground mb-3">
            Panel Operativo
          </h2>
          <p className="text-muted-foreground text-lg">
            ¡Hola! Mirá el estado actual de las rutas y paquetes asignados.
          </p>
          <div className="w-16 h-1 bg-primary mt-6" />
        </div>

        {/* ── STATS Y BUSCADOR ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-8">
            <StatsEnvios
              totalInicial={envios.length}
              enCaminoInicial={enCamino}
              entregadosInicial={entregados}
            />
          </div>

          <div className="lg:col-span-4 bg-card text-card-foreground rounded-2xl shadow-sm p-6 border border-border flex flex-col justify-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Search size={16} className="text-primary" />
              Rastrear Orden
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Ingresar ID de envío..."
                className="w-full bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground rounded-xl py-3 pl-4 pr-10 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-accent transition-colors">
                <Truck size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ── COMPONENTE DE FILTRADO INTERACTIVO CON SU BOTONERA ── */}
        <PanelFiltroEnvios enviosIniciales={envios} />
      </div>
    </main>
  );
}