"use client";

import { useState, useEffect } from "react";
import { Package, Truck, History } from "lucide-react";

export default function StatsEnvios({ 
  totalInicial, 
  enCaminoInicial, 
  entregadosInicial 
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

      // Restás 1 del estado anterior
      if (anterior === "EN CAMINO") setEnCamino(v => v - 1);
      if (anterior === "ENTREGADO") setEntregados(v => v - 1);

      // Sumás 1 al nuevo estado
      if (nuevo === "EN CAMINO") setEnCamino(v => v + 1);
      if (nuevo === "ENTREGADO") setEntregados(v => v + 1);
    }

    window.addEventListener("estadoCambiado", handleCambio as EventListener);
    return () => window.removeEventListener("estadoCambiado", handleCambio as EventListener);
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-10">
      <div className="bg-white rounded-3xl p-6 shadow-sm border-b-4 border-pink-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase text-slate-500 font-semibold">Total asignados</p>
            <h2 className="text-5xl font-black mt-2 text-slate-900">{totalInicial}</h2>
          </div>
          <Package size={36} className="text-pink-300" />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border-b-4 border-orange-400">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase text-slate-500 font-semibold">En tránsito</p>
            <h2 className="text-5xl font-black mt-2 text-slate-900">{enCamino}</h2>
          </div>
          <Truck size={36} className="text-orange-400" />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border-b-4 border-green-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase text-slate-500 font-semibold">Entregados</p>
            <h2 className="text-5xl font-black mt-2 text-slate-900">{entregados}</h2>
          </div>
          <History size={36} className="text-green-300" />
        </div>
      </div>
    </div>
  );
}