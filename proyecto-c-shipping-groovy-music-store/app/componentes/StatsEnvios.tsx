"use client";

import { useState, useEffect } from "react";
import { Package, Truck, History } from "lucide-react";

export default function StatsEnvios({
  totalInicial,
  enCaminoInicial,
  entregadosInicial,
}: {
  totalInicial: number;
  enCaminoInicial: number;
  entregadosInicial: number;
}) {
  const [enCamino, setEnCamino] = useState(enCaminoInicial);
  const [entregados, setEntregados] = useState(entregadosInicial);

  // Sincroniza el estado local cuando el servidor revalida los datos,
  // por ejemplo al eliminar un envío o cambiar de filtro
  const [prevEnCaminoInicial, setPrevEnCaminoInicial] = useState(enCaminoInicial);
  if (enCaminoInicial !== prevEnCaminoInicial) {
    setPrevEnCaminoInicial(enCaminoInicial);
    setEnCamino(enCaminoInicial);
  }

  const [prevEntregadosInicial, setPrevEntregadosInicial] = useState(entregadosInicial);
  if (entregadosInicial !== prevEntregadosInicial) {
    setPrevEntregadosInicial(entregadosInicial);
    setEntregados(entregadosInicial);
  }

  // Escucha el evento "estadoCambiado" emitido por EnvioCard al cambiar el estado de un envío.
  // Actualiza los contadores restando el estado anterior y sumando el nuevo.
  useEffect(() => {
    function handleCambio(e: CustomEvent) {
      const { anterior, nuevo } = e.detail;

      if (anterior === "EN CAMINO") setEnCamino((v) => v - 1);
      if (anterior === "ENTREGADO") setEntregados((v) => v - 1);

      if (nuevo === "EN CAMINO") setEnCamino((v) => v + 1);
      if (nuevo === "ENTREGADO") setEntregados((v) => v + 1);
    }

    window.addEventListener("estadoCambiado", handleCambio as EventListener);
    return () => window.removeEventListener("estadoCambiado", handleCambio as EventListener);
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-6 h-full">

      {/* TOTAL — cantidad fija de envíos asignados al usuario o empresa */}
      <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm p-6 border-b-4 border-b-primary">
        <div className="flex items-center justify-between h-full">
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
              Total asignados
            </p>
            <h2 className="text-5xl font-black mt-3 text-foreground">
              {totalInicial}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Package size={22} className="text-primary" />
          </div>
        </div>
      </div>

      {/* EN CAMINO — se actualiza en tiempo real al cambiar estado en una tarjeta */}
      <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm p-6 border-b-4 border-b-accent">
        <div className="flex items-center justify-between h-full">
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
              En tránsito
            </p>
            <h2 className="text-5xl font-black mt-3 text-foreground">
              {enCamino}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Truck size={22} className="text-accent" />
          </div>
        </div>
      </div>

      {/* ENTREGADOS — se actualiza en tiempo real al cambiar estado en una tarjeta */}
      <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm p-6 border-b-4 border-b-secondary">
        <div className="flex items-center justify-between h-full">
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
              Entregados
            </p>
            <h2 className="text-5xl font-black mt-3 text-foreground">
              {entregados}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
            <History size={22} className="text-secondary" />
          </div>
        </div>
      </div>

    </div>
  );
}