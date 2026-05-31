"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function BuscadorEnvios() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Texto del input, inicializado con el valor actual de "query" en la URL
  const [idBusqueda, setIdBusqueda] = useState(searchParams.get("query") || "");

  // Actualiza el parámetro "query" en la URL y redirige a la página 1
  // Si el campo está vacío elimina el parámetro para mostrar todos los envíos
  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (idBusqueda.trim() !== "") {
      params.set("query", idBusqueda.trim());
    } else {
      params.delete("query");
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleBuscar} className="relative w-full max-w-md">
      <input
        type="text"
        value={idBusqueda}
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