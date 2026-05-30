"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react"; // Usamos una lupa en vez del camioncito

export default function BuscadorEnvios() {
  const [idBusqueda, setIdBusqueda] = useState("");
  const router = useRouter();

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    
    if (idBusqueda.trim() !== "") {
      // Redirige a la página del envío específico usando el ID interno
      router.push(`/envio/${idBusqueda.trim()}`);
    }
  };

  return (
    <form onSubmit={handleBuscar} className="relative w-full max-w-md">
      <input
        type="text"
        value={idBusqueda}
        onChange={(e) => setIdBusqueda(e.target.value)}
        placeholder="Ingresar ID interno del envío..."
        className="w-full bg-card border border-border text-foreground placeholder:text-muted-foreground rounded-xl py-3 pl-4 pr-10 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm shadow-sm"
      />
      <button 
        type="submit" 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
        title="Buscar envío"
      >
        <Search size={18} />
      </button>
    </form>
  );
}