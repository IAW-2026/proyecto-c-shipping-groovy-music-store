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

      {/* TOTAL */}
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

      {/* EN CAMINO */}
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

      {/* ENTREGADOS */}
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
