"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { eliminarEnvio } from "@/app/shipping/acciones";

/**
 * Props del componente BotonEliminar.
 *
 * @property envioId - UUID del envío que se desea eliminar
 */
interface BotonEliminarProps {
  envioId: string;
}

/**
 * BotonEliminar
 *
 * Componente cliente que renderiza un botón para finalizar y eliminar un envío.
 * Al hacer click muestra un modal de confirmación antes de ejecutar la acción.
 * Utiliza useTransition para deshabilitar la UI mientras la Server Action está en curso.
 *
 * @param envioId - UUID del envío a eliminar
 */
export default function BotonEliminar({ envioId }: BotonEliminarProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Abre el modal de confirmación.
   * Frena la propagación del evento para evitar redirigir la tarjeta padre.
   */
  const abrirModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(true);
  };

  /**
   * Cierra el modal de confirmación.
   * Frena la propagación del evento para evitar redirigir la tarjeta padre.
   */
  const cerrarModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(false);
  };

  /**
   * Ejecuta la eliminación del envío llamando a la Server Action eliminarEnvio.
   * Si la acción falla muestra un alert con el mensaje de error.
   * Si tiene éxito cierra el modal automáticamente.
   */
  const handleEliminar = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    startTransition(async () => {
      const res = await eliminarEnvio(envioId);
      if (!res.success) {
        alert(res.error);
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      {/* ── BOTÓN PRINCIPAL ── */}
      <button
        onClick={abrirModal}
        disabled={isPending}
        className={`px-4 py-2 bg-red-500/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-200/40 hover:border-red-600 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider shadow-sm ${
          isPending ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
        }`}
      >
        <Trash2 size={14} />
        {isPending ? "Finalizando..." : "Finalizar envío"}
      </button>

      {/* ── MODAL DE CONFIRMACIÓN ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={cerrarModal}
        >
          <div
            className="bg-card text-card-foreground border border-border rounded-3xl shadow-2xl w-full max-w-md p-6 relative transform scale-100 transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabezal de Advertencia */}
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <div className="p-2 bg-red-500/10 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">
                ¿Desea finalizar el envío?
              </h3>
            </div>

            {/* Cuerpo del Mensaje */}
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Esta acción completará el ciclo del paquete y eliminará el registro
              de forma permanente del panel activo. Asegurate de que haya sido
              entregado correctamente.
            </p>

            {/* Botonera de Acción */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={cerrarModal}
                disabled={isPending}
                className="px-4 py-2.5 border border-border hover:bg-muted rounded-xl text-xs font-bold uppercase tracking-wider transition-colors text-muted-foreground"
              >
                No, cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={isPending}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
              >
                {isPending ? "Procesando..." : "Sí, finalizar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}