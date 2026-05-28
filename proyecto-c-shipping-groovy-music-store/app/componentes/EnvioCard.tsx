"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, MapPin, History, ChevronDown, Check } from "lucide-react";

import BotonEliminar from "./BotonEliminar"; 

const ESTADOS = ["EN PREPARACIÓN", "EN CAMINO", "ENTREGADO"] as const;

export interface Evento {
  id: number;
  envio_id: number;
  descripcion: string;
  timestamp: string | Date;
}

export interface Envio {
  id: number;
  order_id: string;
  seller_id: number;
  buyer_id: number;
  direccion_id: number;
  estado: string;
  empresaId: number;
  empresa?: {
    id: number;
    nombre: string;
  } | null;
  direccion?: {
    id: number;
    calle: string;
    ciudad: string;
    provincia: string;
    cod_postal: string;
    pais: string;
  } | null;
  eventos?: Evento[];
}

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

// Generador de ID simulado fuera del render para evitar advertencias de impureza
function generarIdSimulado() {
  return Date.now();
}

export default function EnvioCard({ 
  envio,
  onEstadoCambiado 
}: { 
  envio: Envio;
  onEstadoCambiado?: (id: number, nuevoEstado: string) => void;
}) {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [estadoActual, setEstadoActual] = useState(envio.estado);
  
  const [eventosActuales, setEventosActuales] = useState<Evento[]>(envio.eventos || []);

  async function handleCambiarEstado(nuevoEstado: (typeof ESTADOS)[number]) {
    const estadoAnterior = estadoActual;
    const eventosAnteriores = eventosActuales;

    setEstadoActual(nuevoEstado);
    
    const nuevoEventoSimulado: Evento = {
      id: generarIdSimulado(), 
      envio_id: envio.id,
      descripcion: nuevoEstado, 
      timestamp: new Date()
    };
    
    setEventosActuales([nuevoEventoSimulado, ...eventosAnteriores]);
    
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
        setEventosActuales(eventosAnteriores);
        alert("Error al cambiar estado");
        return;
      }

      window.dispatchEvent(
        new CustomEvent("estadoCambiado", {
          detail: { anterior: estadoAnterior, nuevo: nuevoEstado },
        })
      );

      if (onEstadoCambiado) {
        onEstadoCambiado(envio.id, nuevoEstado);
      }
      
    } catch {
      setEstadoActual(estadoAnterior);
      setEventosActuales(eventosAnteriores);
      alert("Error al cambiar estado");
    } finally {
      setCargando(false);
    }
  }

  const indiceActual = ESTADOS.indexOf(estadoActual as typeof ESTADOS[number]);
  const porcentaje = (indiceActual / (ESTADOS.length - 1)) * 100;

  return (
    <Link
      href={`/envios/${envio.id}`}
      // 👇 Claves: 'relative' y 'group' para que el botón flotante funcione con el hover
      className="block relative group bg-card text-card-foreground rounded-3xl border border-border shadow-md hover:shadow-xl hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300"
    >
      
      {/* ── BOTÓN ELIMINAR FLOTANTE ── */}
      {estadoActual === "ENTREGADO" && (
        <div 
          className="absolute top-6 right-6 md:top-7 md:right-7 z-20"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // Evita que se dispare la redirección de Link
          }}
        >
          {/* Ajustá los props de BotonEliminar según cómo lo hayas armado (ej: envioId, id, envio) */}
          <BotonEliminar envioId={envio.id} />
        </div>
      )}

      <div className="p-8 md:p-10">
        <div className="grid md:grid-cols-3 gap-8 items-center">

          {/* ── IZQUIERDA ── */}
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

          {/* ── CENTRO ── */}
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

          {/* ── DERECHA ── */}
          <div
            className={`flex flex-col gap-2 md:items-end relative transition-all duration-300 ${
              estadoActual === "ENTREGADO" ? "md:pt-12" : ""
            }`}
            onClick={(e) => e.preventDefault()}
          >
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
          mostrarHistorial ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
        onClick={(e) => e.preventDefault()}
      >
        <div className="px-6 pb-6 border-t border-border pt-5 bg-muted/20 rounded-b-2xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-8 flex items-center gap-2">
            <Package size={14} />
            Progreso del envío
          </h3>

          <div className="relative mb-14 px-4">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-border -translate-y-1/2 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${porcentaje}%` }}
            ></div>

            <div className="relative flex justify-between z-10">
              {ESTADOS.map((estado, index) => {
                const isCompleted = indiceActual >= index;
                const isCurrent = indiceActual === index;
                
                return (
                  <div key={estado} className="flex flex-col items-center">
                    <div 
                      className={`w-7 h-7 rounded-full border-4 flex items-center justify-center transition-all duration-700 ${
                        isCompleted ? "bg-primary border-card" : "bg-muted border-card"
                      } ${isCurrent ? "ring-4 ring-primary/20 scale-125" : ""}`}
                    >
                      {isCompleted && <Check size={14} className="text-primary-foreground stroke-[3]" />}
                    </div>
                    <span className={`absolute top-10 text-[10px] font-bold uppercase tracking-wider text-center w-28 transition-colors duration-500 ${
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {estado}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2 mt-8">
            <History size={14} />
            Registro de eventos
          </h3>
          <ul className="space-y-3">
            {eventosActuales.map((evento: Evento, index: number) => (
              <li key={evento.id} className="flex items-start gap-3 text-sm transition-all duration-300">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    index === 0 ? "bg-primary animate-pulse" : "bg-muted-foreground/40"
                  }`}
                />
                <span className={index === 0 ? "font-semibold text-foreground uppercase tracking-wider" : "text-muted-foreground uppercase tracking-wider"}>
                  {evento.descripcion}
                </span>
              </li>
            ))}
            
            {eventosActuales.length === 0 && (
              <li className="text-sm text-muted-foreground italic">No hay historial de movimientos.</li>
            )}
          </ul>
        </div>
      </div>
    </Link>
  );
}