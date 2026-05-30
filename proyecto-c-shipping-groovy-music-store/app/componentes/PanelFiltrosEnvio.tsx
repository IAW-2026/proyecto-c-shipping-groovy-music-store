"use client";

import { useState } from "react";
import EnvioCard from "@/app/componentes/EnvioCard";
import { Search } from "lucide-react";

export default function PanelFiltroEnvios({ enviosIniciales }: { enviosIniciales: any[] }) {
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  // Le cambiamos el nombre a la variable para que tenga más sentido
  const [busquedaCodigo, setBusquedaCodigo] = useState("");

  // Lógica de filtrado combinada
  const enviosFiltrados = enviosIniciales.filter((envio) => {
    const coincideEstado = filtroEstado === "TODOS" || envio.estado === filtroEstado;
    
    // IMPORTANTE: Ahora buscamos en el "codigo_seguimiento" (ej: GRV-0001)
    // Agregamos un fallback (envio.codigo_seguimiento || "") por si algún envío viejo no tiene el código
    const codigo = envio.codigo_seguimiento || "";
    const coincideBusqueda = codigo.toLowerCase().includes(busquedaCodigo.trim().toLowerCase());

    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="space-y-6">
      {/* ── BARRA DE CONTROLES (BOTONES + BUSCADOR ALINEADO A LA DERECHA) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
        
        {/* BOTONES DE FILTRO (IZQUIERDA) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFiltroEstado("TODOS")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filtroEstado === "TODOS"
                ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            Todos ({enviosIniciales.length})
          </button>
          <button
            onClick={() => setFiltroEstado("EN CAMINO")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filtroEstado === "EN CAMINO"
                ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            En camino ({enviosIniciales.filter(e => e.estado === "EN CAMINO").length})
          </button>
          <button
            onClick={() => setFiltroEstado("ENTREGADO")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filtroEstado === "ENTREGADO"
                ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            Entregados ({enviosIniciales.filter(e => e.estado === "ENTREGADO").length})
          </button>
        </div>

        {/* BUSCADOR POR CÓDIGO EN TIEMPO REAL (DERECHA) */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={busquedaCodigo}
            onChange={(e) => setBusquedaCodigo(e.target.value)}
            // Actualizamos el texto de ayuda
            placeholder="Buscar por código (ej. GRV-0001)..."
            className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground rounded-xl py-2.5 pl-4 pr-10 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
          />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* ── LISTADO DE TARJETAS FILTRADAS ── */}
      {enviosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {enviosFiltrados.map((envio) => (
            <EnvioCard key={envio.id} envio={envio} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card border border-border rounded-2xl">
          <p className="text-muted-foreground font-medium">
            No se encontraron envíos con ese código de seguimiento.
          </p>
        </div>
      )}
    </div>
  );
}