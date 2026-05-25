"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { eliminarEnvio } from "@/app/shipping/acciones";

export default function BotonEliminar({ envioId }: { envioId: number }) {
  const [isPending, startTransition] = useTransition();

  const handleEliminar = (e: React.MouseEvent) => {
    // ¡CLAVE! Detiene la propagación del evento para que al hacer click en el tacho
    // NO se abra el historial ni se ejecute ninguna redirección de la EnvioCard básica
    e.stopPropagation();
    e.preventDefault();

    if (confirm("¿Estás seguro de que querés eliminar permanentemente este envío entregado?")) {
      startTransition(async () => {
        const res = await eliminarEnvio(envioId);
        if (!res.success) {
          alert(res.error);
        }
      });
    }
  };

  return (
    <button
      onClick={handleEliminar}
      disabled={isPending}
      className={`p-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition-all shadow-sm ${
        isPending ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
      }`}
      title="Eliminar registro de envío"
    >
      <Trash2 size={16} />
    </button>
  );
}