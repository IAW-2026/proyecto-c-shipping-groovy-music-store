import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/auth";

import {
  Truck,
  Package,
  MapPin,
  History,
} from "lucide-react";

function getEstadoStyles(estado: string) {
  switch (estado) {
    case "EN PREPARACIÓN":
      return "bg-slate-100 text-slate-700";
    case "EN CAMINO":
      return "bg-orange-100 text-orange-700";
    case "ENTREGADO":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default async function Home() {
  // 1. Obtener el usuario logueado en Clerk y validado en Prisma
  const user = await getCurrentUser();

  // 2. Si no hay usuario, redirigir
  if (!user) {
    redirect("/sign-in");
  }

  // 3. Si es ADMIN ve todos los envíos; si no, solo los de su empresa
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
              <h1 className="text-3xl font-black text-slate-900">
                Groovy Logística
              </h1>
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
              <UserButton/>
            </div>
          </div>
        </header>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* TOTAL */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-b-4 border-pink-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase text-slate-500 font-semibold">
                  Total asignados
                </p>
                <h2 className="text-5xl font-black mt-2 text-slate-900">
                  {envios.length}
                </h2>
              </div>
              <Package size={36} className="text-pink-300" />
            </div>
          </div>

          {/* EN CAMINO */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-b-4 border-orange-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase text-slate-500 font-semibold">
                  En tránsito
                </p>
                <h2 className="text-5xl font-black mt-2 text-slate-900">
                  {enCamino}
                </h2>
              </div>
              <Truck size={36} className="text-orange-400" />
            </div>
          </div>

          {/* ENTREGADOS */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-b-4 border-green-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase text-slate-500 font-semibold">
                  Entregados
                </p>
                <h2 className="text-5xl font-black mt-2 text-slate-900">
                  {entregados}
                </h2>
              </div>
              <History size={36} className="text-green-300" />
            </div>
          </div>
        </div>

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
            <Link
              key={envio.id}
              href={`/envios/${envio.id}`}
              className="block bg-white rounded-3xl p-7 border border-orange-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div className="grid md:grid-cols-3 gap-8 items-center">
                {/* IZQUIERDA */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xl font-black text-slate-900">
                      {envio.order_id}
                    </span>
                    <span
                      className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${getEstadoStyles(
                        envio.estado
                      )}`}
                    >
                      {envio.estado}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Package size={18} className="text-slate-400 mt-1" />
                      <div>
                        <p className="text-xs uppercase font-bold text-slate-400">
                          Operador logístico
                        </p>
                        <p className="font-semibold text-slate-800">
                          {envio.empresa?.nombre || "Empresa no asignada"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CENTRO */}
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-orange-400 mt-1" />
                    <div>
                      <p className="text-xs uppercase font-bold text-orange-400">
                        Destino
                      </p>
                      <p className="font-semibold text-lg text-slate-900">
                        {envio.direccion?.calle}
                      </p>
                      <p className="text-slate-500">
                        {envio.direccion?.ciudad},{" "}
                        {envio.direccion?.provincia}
                      </p>
                      <p className="text-sm text-slate-400">
                        CP {envio.direccion?.cod_postal}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DERECHA */}
                <div className="flex flex-col gap-3 md:items-end">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-6 py-3 font-semibold shadow-sm transition">
                    Actualizar estado
                  </button>

                  <button className="border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-2xl px-6 py-3 text-slate-600 font-medium transition">
                    Ver historial
                  </button>
                </div>
              </div>

              {/* HISTORIAL */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                  <History size={16} />
                  Historial de movimientos
                </h3>

                <ul className="space-y-3">
                  {envio.eventos.map((evento, index) => (
                    <li key={evento.id} className="flex items-start gap-3 text-sm">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                          index === 0 ? "bg-orange-500" : "bg-slate-300"
                        }`}
                      />
                      <span
                        className={
                          index === 0
                            ? "font-semibold text-slate-800"
                            : "text-slate-500"
                        }
                      >
                        {evento.descripcion}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}

          {/* MENSAJE SI NO HAY ENVÍOS */}
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
