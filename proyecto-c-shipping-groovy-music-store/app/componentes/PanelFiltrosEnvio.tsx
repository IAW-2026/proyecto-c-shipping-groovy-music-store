"use client";

import { useState } from "react";
import EnvioCard from "@/app/componentes/EnvioCard";
import { Search } from "lucide-react";

export default function PanelFiltroEnvios({ enviosIniciales }: { enviosIniciales: any[] }) {
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [busquedaId, setBusquedaId] = useState(""); 

  const enviosFiltrados = enviosIniciales.filter((envio) => {

    const coincideEstado = filtroEstado === "TODOS" || envio.estado === filtroEstado;
    

    const coincideBusqueda = envio.id.toString().includes(busquedaId);

    // Solo se muestra la tarjeta si cumple con AMBAS cosas
    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="space-y-6">
      {/* ── CONTROLES: BUSCADOR Y BOTONES EN LA MISMA CAJA ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        
        {/* BUSCADOR EN TIEMPO REAL */}
        <div className="relative w-full lg:w-1/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Buscar por ID numérico..."
            value={busquedaId}
            onChange={(e) => setBusquedaId(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        {/* BOTONERA DE FILTROS */}
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <button onClick={() => setFiltroEstado("TODOS")} className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${filtroEstado === "TODOS" ? "bg-primary text-primary-foreground shadow-md" : "bg-background text-muted-foreground hover:bg-muted border border-border"}`}>Todos</button>
          <button onClick={() => setFiltroEstado("EN PREPARACIÓN")} className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${filtroEstado === "EN PREPARACIÓN" ? "bg-primary text-primary-foreground shadow-md" : "bg-background text-muted-foreground hover:bg-muted border border-border"}`}>En Preparación</button>
          <button onClick={() => setFiltroEstado("EN CAMINO")} className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${filtroEstado === "EN CAMINO" ? "bg-primary text-primary-foreground shadow-md" : "bg-background text-muted-foreground hover:bg-muted border border-border"}`}>En Camino</button>
          <button onClick={() => setFiltroEstado("ENTREGADO")} className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${filtroEstado === "ENTREGADO" ? "bg-primary text-primary-foreground shadow-md" : "bg-background text-muted-foreground hover:bg-muted border border-border"}`}>Entregados</button>
        </div>
      </div>

      {/* ── LISTA DE TARJETAS DE ENVÍO ── */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {enviosFiltrados.length > 0 ? (
          enviosFiltrados.map((envio) => (
            <EnvioCard key={envio.id} envio={envio} />
          ))
        ) : (
          /* MENSAJE SI NO HAY COINCIDENCIAS (El buscador desaparece las tarjetas y muestra esto) */
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-card rounded-2xl border border-dashed border-border">
            <Search size={48} className="text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No hay resultados</h3>
            <p className="text-muted-foreground">
              No se encontraron envíos que coincidan con el ID <span className="font-bold text-primary">"{busquedaId}"</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}