"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react"; 

export default function BuscadorEnvios() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inicializamos el texto con lo que ya esté en la URL
  const [idBusqueda, setIdBusqueda] = useState(searchParams.get("query") || "");

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página recargue parpadeando
    
    // Armamos la nueva URL
    const params = new URLSearchParams(searchParams.toString());
    
    if (idBusqueda.trim() !== "") {
      params.set("query", idBusqueda.trim());
    } else {
      params.delete("query");
    }
    
    // Al buscar algo nuevo, siempre mandamos al usuario a la página 1
    params.set("page", "1");

    // Navegamos inyectando los parámetros en la URL actual
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleBuscar} className="relative w-full max-w-md">
      <input
        type="text"
        value={idBusqueda} // (Podés dejar el nombre de la variable igual, no afecta)
        onChange={(e) => setIdBusqueda(e.target.value)}
        placeholder="Ingresar código de seguimiento..." 
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