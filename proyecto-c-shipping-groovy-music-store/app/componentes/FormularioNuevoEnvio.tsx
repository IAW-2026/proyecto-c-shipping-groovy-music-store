"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearEnvio } from "@/app/shipping/acciones";

// Forma de los datos de una empresa para el selector
interface Empresa {
  id: string;
  nombre: string;
}

export default function FormularioNuevoEnvio({ empresas }: { empresas: Empresa[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Errores por campo devueltos por la Server Action
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Llama a la Server Action crearEnvio con los datos del formulario.
  // Si hay errores de validación los muestra por campo.
  // Si tiene éxito redirige al panel principal.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrores({});

    const formData = new FormData(e.currentTarget);
    const res = await crearEnvio(formData);

    if (!res.success) {
      setErrores(res.errores || {});
      setIsLoading(false);
      return;
    }

    router.push("/shipping");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* SELLER ID */}
      <div>
        <label htmlFor="seller_id" className="block text-sm font-semibold uppercase tracking-wider mb-2">
          ID del Vendedor
        </label>
        <input
          id="seller_id"
          name="seller_id"
          type="text"
          placeholder="ej: user_abc123"
          className="w-full bg-card border border-border rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
        {errores.seller_id && (
          <p className="text-red-500 text-xs mt-1">{errores.seller_id}</p>
        )}
      </div>

      {/* BUYER ID */}
      <div>
        <label htmlFor="buyer_id" className="block text-sm font-semibold uppercase tracking-wider mb-2">
          ID del Comprador
        </label>
        <input
          id="buyer_id"
          name="buyer_id"
          type="text"
          placeholder="ej: user_xyz789"
          className="w-full bg-card border border-border rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
        {errores.buyer_id && (
          <p className="text-red-500 text-xs mt-1">{errores.buyer_id}</p>
        )}
      </div>

      {/* DIRECCIÓN */}
      <div className="p-4 border border-border rounded-2xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wider">
          Dirección de entrega
        </p>

        <div>
          <input
            id="calle"
            name="calle"
            type="text"
            aria-label="Calle y número"
            placeholder="Calle y número"
            className="w-full bg-card border border-border rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {errores.calle && (
            <p className="text-red-500 text-xs mt-1">{errores.calle}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              id="ciudad"
              name="ciudad"
              type="text"
              aria-label="Ciudad"
              placeholder="Ciudad"
              className="w-full bg-card border border-border rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            {errores.ciudad && (
              <p className="text-red-500 text-xs mt-1">{errores.ciudad}</p>
            )}
          </div>
          <div>
            <input
              id="provincia"
              name="provincia"
              type="text"
              aria-label="Provincia"
              placeholder="Provincia"
              className="w-full bg-card border border-border rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            {errores.provincia && (
              <p className="text-red-500 text-xs mt-1">{errores.provincia}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              id="cod_postal"
              name="cod_postal"
              type="text"
              aria-label="Código postal"
              placeholder="Código postal"
              className="w-full bg-card border border-border rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            {errores.cod_postal && (
              <p className="text-red-500 text-xs mt-1">{errores.cod_postal}</p>
            )}
          </div>
          <div>
            <input
              id="pais"
              name="pais"
              type="text"
              aria-label="País"
              placeholder="País"
              defaultValue="Argentina"
              className="w-full bg-card border border-border rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* EMPRESA — selector con las empresas traídas desde la BD */}
      <div>
        <label htmlFor="empresaId" className="block text-sm font-semibold uppercase tracking-wider mb-2">
          Empresa de logística
        </label>
        <select
          id="empresaId"
          name="empresaId"
          className="w-full bg-card border border-border rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        >
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.nombre}
            </option>
          ))}
        </select>
        {errores.empresaId && (
          <p className="text-red-500 text-xs mt-1">{errores.empresaId}</p>
        )}
      </div>

      {/* FECHA ESTIMADA — campo obligatorio */}
      <div>
        <label htmlFor="fecha_entrega_estimada" className="block text-sm font-semibold uppercase tracking-wider mb-2">
          Fecha de entrega estimada
        </label>
        <input
          id="fecha_entrega_estimada"
          name="fecha_entrega_estimada"
          type="date"
          className="w-full bg-card border border-border rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
        {errores.fecha_entrega_estimada && (
          <p className="text-red-500 text-xs mt-1">{errores.fecha_entrega_estimada}</p>
        )}
      </div>

      {/* BOTONES */}
      <div className="flex items-center justify-end gap-3 pt-4">
        {/* Cancela y vuelve al panel sin guardar */}
        <button
          type="button"
          onClick={() => router.push("/shipping")}
          className="px-5 py-3 border border-border rounded-xl text-sm font-semibold uppercase tracking-wider hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isLoading ? "Creando..." : "Crear Envío"}
        </button>
      </div>
    </form>
  );
}