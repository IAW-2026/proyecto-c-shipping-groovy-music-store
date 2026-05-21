"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, MapPin, History, ChevronDown } from "lucide-react";

const ESTADOS = ["EN PREPARACIÓN", "EN CAMINO", "ENTREGADO"] as const;

export default function EnvioCard({ envio }: { envio: any }) {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [estadoActual, setEstadoActual] = useState(envio.estado);

  function getEstadoStyles(estado: string) {
    switch (estado) {
      case "EN PREPARACIÓN": return "bg-slate-100 text-slate-700";
      case "EN CAMINO":      return "bg-orange-100 text-orange-700";
      case "ENTREGADO":      return "bg-green-100 text-green-700";
      default:               return "bg-gray-100 text-gray-700";
    }
  }

  async function handleCambiarEstado(nuevoEstado: typeof ESTADOS[number]) {
    const estadoAnterior = estadoActual;
    setEstadoActual(nuevoEstado);
    setMostrarDropdown(false);
    setCargando(true);

    await fetch(`/api/envios/${envio.id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    window.dispatchEvent(new CustomEvent("estadoCambiado", {
      detail: { anterior: estadoAnterior, nuevo: nuevoEstado }
    }));

    setCargando(false);
  }

  return (
    <Link
      href={`/envios/${envio.id}`}
      className="block bg-white rounded-3xl p-7 border border-orange-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="grid md:grid-cols-3 gap-8 items-center">

        {/* IZQUIERDA */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xl font-black text-slate-900">{envio.order_id}</span>
            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${getEstadoStyles(estadoActual)}`}>
              {estadoActual}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <Package size={18} className="text-slate-400 mt-1" />
            <div>
              <p className="text-xs uppercase font-bold text-slate-400">Operador logístico</p>
              <p className="font-semibold text-slate-800">{envio.empresa?.nombre || "Empresa no asignada"}</p>
            </div>
          </div>
        </div>

        {/* CENTRO */}
        <div>
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-orange-400 mt-1" />
            <div>
              <p className="text-xs uppercase font-bold text-orange-400">Destino</p>
              <p className="font-semibold text-lg text-slate-900">{envio.direccion?.calle}</p>
              <p className="text-slate-500">{envio.direccion?.ciudad}, {envio.direccion?.provincia}</p>
              <p className="text-sm text-slate-400">CP {envio.direccion?.cod_postal}</p>
            </div>
          </div>
        </div>

        {/* DERECHA */}
        <div
          className="flex flex-col gap-3 md:items-end"
          onClick={(e) => e.preventDefault()}
        >
          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setMostrarDropdown(!mostrarDropdown)}
              disabled={cargando}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-2xl px-6 py-3 font-semibold shadow-sm transition flex items-center justify-center gap-2 w-full"
            >
              {cargando ? "Actualizando..." : "Cambiar estado"}
              <ChevronDown size={16} className={`transition-transform ${mostrarDropdown ? "rotate-180" : ""}`} />
            </button>

            {mostrarDropdown && (
              <div className="absolute right-0 top-14 z-10 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden w-full min-w-[180px]">
                {ESTADOS.map((estado) => (
                  <button
                    key={estado}
                    onClick={() => handleCambiarEstado(estado)}
                    className={`w-full text-left px-5 py-3 text-sm font-medium hover:bg-orange-50 transition
                      ${estadoActual === estado ? "opacity-40 cursor-default pointer-events-none" : ""}
                    `}
                  >
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${getEstadoStyles(estado)}`}>
                      {estado}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
            className="border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-2xl px-6 py-3 text-slate-600 font-medium transition flex items-center justify-center gap-2 w-full md:w-auto"
          >
            {mostrarHistorial ? "Ocultar historial" : "Ver historial"}
            <History size={18} className={`transition-transform duration-300 ${mostrarHistorial ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* HISTORIAL */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          mostrarHistorial
            ? "max-h-96 opacity-100 mt-8 border-t border-slate-100 pt-6"
            : "max-h-0 opacity-0 mt-0 border-transparent pt-0"
        }`}
        onClick={(e) => e.preventDefault()}
      >
        <h3 className="text-sm font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
          <History size={16} /> Historial de movimientos
        </h3>
        <ul className="space-y-3">
          {envio.eventos?.map((evento: any, index: number) => (
            <li key={evento.id} className="flex items-start gap-3 text-sm">
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${index === 0 ? "bg-orange-500" : "bg-slate-300"}`} />
              <span className={index === 0 ? "font-semibold text-slate-800" : "text-slate-500"}>
                {evento.descripcion}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}