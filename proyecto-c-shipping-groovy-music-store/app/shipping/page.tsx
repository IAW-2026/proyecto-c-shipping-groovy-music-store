import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/auth";
import EnvioCard from "@/app/componentes/EnvioCard";
import StatsEnvios from "@/app/componentes/StatsEnvios";
import { Truck, History } from "lucide-react";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = user?.role === "ADMIN";

  const envios = await prisma.envio.findMany({
    where: isAdmin ? {} : { empresaId: user?.empresaId },
    include: {
      direccion: true,
      empresa: true,
      eventos: true,
    },
  });

  const entregados = envios.filter((e) => e.estado === "ENTREGADO").length;
  const enCamino = envios.filter((e) => e.estado === "EN CAMINO").length;

  return (
    <main className="min-h-screen bg-[#f6ddd2] py-10 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-[#8ca7a3] p-4 rounded-2xl shadow-sm">
              <Truck className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Groovy Logística</h1>
              <p className="text-slate-500">
                {isAdmin ? "Panel de administración" : "Panel de operadores logísticos"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
              {isAdmin ? "AD" : "OP"}
            </div>
            <div className="bg-white p-2 rounded-full shadow-sm">
              <UserButton />
            </div>
          </div>
        </header>

        {/* STATS */}
        <StatsEnvios
          totalInicial={envios.length}
          enCaminoInicial={enCamino}
          entregadosInicial={entregados}
        />

        {/* BUSCADOR */}
        <div className="bg-white rounded-3xl p-5 mb-8 border border-orange-200 shadow-sm">
          <input
            type="text"
            placeholder="Buscar ID Orden..."
            className="w-full rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-orange-400 text-slate-700"
          />
        </div>

        {/* LISTA */}
        <div className="space-y-6">
          {envios.map((envio) => (
            <EnvioCard key={envio.id} envio={envio} />
          ))}

          {envios.length === 0 && (
            <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-orange-200">
              <History className="w-12 h-12 text-[#bc9d98] mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No hay envíos activos</h3>
              <p className="opacity-70 mt-1">
                No se encontraron paquetes asignados en el sistema en este momento.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}