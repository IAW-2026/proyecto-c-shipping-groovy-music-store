"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, MapPin, History, ChevronDown } from "lucide-react";

const ESTADOS = ["EN PREPARACIÓN", "EN CAMINO", "ENTREGADO"] as const;

function getEstadoStyles(estado: string) {
  switch (estado) {
    case "EN PREPARACIÓN":
      return "bg-muted text-muted-foreground";
    case "EN CAMINO":
      return "bg-primary/15 text-primary";
    case "ENTREGADO":
      return "bg-secondary/15 text-secondary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function EnvioCard({ envio }: { envio: any }) {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [estadoActual, setEstadoActual] = useState(envio.estado);

  async function handleCambiarEstado(nuevoEstado: (typeof ESTADOS)[number]) {
    const estadoAnterior = estadoActual;

    setEstadoActual(nuevoEstado);
    setMostrarDropdown(false);
    setCargando(true);

    try {
      const res = await fetch(`/api/envios/${envio.id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) {
        setEstadoActual(estadoAnterior);
        alert("Error al cambiar estado");
        return;
      }

      window.dispatchEvent(
        new CustomEvent("estadoCambiado", {
          detail: { anterior: estadoAnterior, nuevo: nuevoEstado },
        })
      );
    } catch {
      setEstadoActual(estadoAnterior);
      alert("Error al cambiar estado");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Link
      href={`/envios/${envio.id}`}
      // CORRECCIÓN 1: Eliminamos overflow-hidden de aquí
      className="block bg-card text-card-foreground rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-6">
        <div className="grid md:grid-cols-3 gap-6 items-center">

          {/* ── IZQUIERDA: ID + empresa ── */}
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-lg font-black text-foreground">
                {envio.order_id}
              </span>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${getEstadoStyles(estadoActual)}`}
              >
                {estadoActual}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <Package size={16} className="text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Operador logístico
                </p>
                <p className="font-semibold text-foreground text-sm mt-0.5">
                  {envio.empresa?.nombre || "Empresa no asignada"}
                </p>
              </div>
            </div>
          </div>

          {/* ── CENTRO: destino ── */}
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-primary">
                Destino
              </p>
              <p className="font-semibold text-foreground mt-0.5">
                {envio.direccion?.calle}
              </p>
              <p className="text-muted-foreground text-sm">
                {envio.direccion?.ciudad}, {envio.direccion?.provincia}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                CP {envio.direccion?.cod_postal}
              </p>
            </div>
          </div>

          {/* ── DERECHA: acciones ── */}
          <div
            className="flex flex-col gap-2 md:items-end relative"
            onClick={(e) => e.preventDefault()}
          >
            {/* Dropdown cambiar estado */}
            <div className="relative w-full md:w-auto">
              <button
                onClick={() => setMostrarDropdown(!mostrarDropdown)}
                disabled={cargando}
                className="bg-primary hover:bg-accent disabled:opacity-60 text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-bold uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-2 w-full"
              >
                {cargando ? "Actualizando..." : "Cambiar estado"}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${mostrarDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {mostrarDropdown && (
            
                <div className="absolute right-0 top-12 z-50 bg-card border border-border rounded-2xl shadow-lg overflow-hidden w-full min-w-[200px]">
                  {ESTADOS.map((estado) => (
                    <button
                      key={estado}
                      onClick={() => handleCambiarEstado(estado)}
                      disabled={estadoActual === estado}
                      className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors disabled:opacity-40 disabled:cursor-default"
                    >
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${getEstadoStyles(estado)}`}>
                        {estado}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Botón historial */}
            <button
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              className="border border-border bg-muted/30 hover:bg-muted/60 rounded-xl px-5 py-2.5 text-muted-foreground text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
            >
              {mostrarHistorial ? "Ocultar historial" : "Ver historial"}
              <History
                size={15}
                className={`transition-transform duration-300 ${mostrarHistorial ? "rotate-180" : ""}`}
              />
            </button>
          </div>

        </div>
      </div>

      {/* ── HISTORIAL ── */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          mostrarHistorial
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0"
        }`}
        onClick={(e) => e.preventDefault()}
      >
        {/* CORRECCIÓN 3: Agregamos rounded-b-2xl aquí para mantener las esquinas de abajo redondeadas sin necesidad de que el contenedor principal corte el contenido */}
        <div className="px-6 pb-6 border-t border-border pt-5 bg-muted/20 rounded-b-2xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <History size={14} />
            Historial de movimientos
          </h3>

          <ul className="space-y-3">
            {envio.eventos?.map((evento: any, index: number) => (
              <li key={evento.id} className="flex items-start gap-3 text-sm">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    index === 0 ? "bg-primary" : "bg-muted-foreground/40"
                  }`}
                />
                <span className={index === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}>
                  {evento.descripcion}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Link>
  );
}