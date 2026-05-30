"use client";
import { useState, useRef } from "react"; // ← ya no necesitás useEffect
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import EnvioCard from "@/app/componentes/EnvioCard";
import { Search } from "lucide-react";

const ESTADOS_FILTRO = [
  { label: "Todos", valor: "" },
  { label: "En Preparación", valor: "EN PREPARACIÓN" },
  { label: "En Camino", valor: "EN CAMINO" },
  { label: "Entregado", valor: "ENTREGADO" },
];

interface PanelProps {
  enviosIniciales: any[];
  totalPages: number;
  currentPage: number;
  estadoActivo: string;
}

export default function PanelFiltroEnvios({
  enviosIniciales,
  totalPages,
  currentPage,
  estadoActivo,
}: PanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [textoBusqueda, setTextoBusqueda] = useState(searchParams.get("query") || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce sin useEffect — se dispara solo cuando el usuario escribe
  const handleBusqueda = (texto: string) => {
  setTextoBusqueda(texto);

  if (debounceRef.current) clearTimeout(debounceRef.current); // ← checkea null
  debounceRef.current = setTimeout(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (texto) {
      params.set("query", texto);
    } else {
      params.delete("query");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, 400);
};

  const manejarCambioPagina = (nuevaPagina: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", nuevaPagina.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const manejarFiltroEstado = (valor: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set("estado", valor);
    } else {
      params.delete("estado");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* ── BUSCADOR ── */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={textoBusqueda}
          onChange={(e) => handleBusqueda(e.target.value)} // ← usa la nueva función
          placeholder="Buscar envío por código..."
          className="w-full bg-card text-foreground placeholder:text-muted-foreground border border-border rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
        />
      </div>

      {/* ── FILTROS POR ESTADO ── */}
      <div className="flex flex-wrap gap-2">
        {ESTADOS_FILTRO.map((filtro) => (
          <button
            key={filtro.valor}
            onClick={() => manejarFiltroEstado(filtro.valor)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
              estadoActivo === filtro.valor
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {/* ── TARJETAS ── */}
      <div className="grid grid-cols-1 gap-4">
        {enviosIniciales.map((envio) => (
          <EnvioCard key={envio.id} envio={envio} />
        ))}
        {enviosIniciales.length === 0 && (
          <div className="text-center py-12 bg-card border border-border border-dashed rounded-2xl">
            <p className="text-muted-foreground text-lg">No se encontraron envíos</p>
          </div>
        )}
      </div>

      {/* ── PAGINACIÓN ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 pt-4">
          <button
            onClick={() => manejarCambioPagina(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-5 py-2.5 bg-card text-foreground border border-border rounded-xl font-medium shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/30 transition-all active:scale-95"
          >
            Anterior
          </button>
          <span className="text-muted-foreground font-medium text-sm tracking-wide">
            PÁGINA <span className="text-foreground font-bold">{currentPage}</span> DE {totalPages}
          </span>
          <button
            onClick={() => manejarCambioPagina(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-5 py-2.5 bg-card text-foreground border border-border rounded-xl font-medium shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/30 transition-all active:scale-95"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}