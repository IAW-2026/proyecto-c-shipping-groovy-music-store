"use client";

import { useState, useTransition, useEffect } from "react";
import EnvioCard from "@/app/componentes/EnvioCard";
// Importamos iconos extra para el modal y el botón
import { Trash2, Truck, AlertTriangle, X } from "lucide-react"; 
import { eliminarEnvio } from "@/app/shipping/acciones";

type FiltroType = "todos" | "en-camino" | "entregados";

export default function PanelFiltroEnvios({ enviosIniciales }: { enviosIniciales: any[] }) {
  const [filtro, setFiltro] = useState<FiltroType>("todos");
  const [listaEnvios, setListaEnvios] = useState(enviosIniciales);
  const [isPending, startTransition] = useTransition();

  // ── NUEVOS ESTADOS PARA EL MODAL DE CONFIRMACIÓN ──
  const [showModal, setShowModal] = useState(false);
  const [selectedEnvioId, setSelectedEnvioId] = useState<string | null>(null);

  useEffect(() => {
    setListaEnvios(enviosIniciales);
  }, [enviosIniciales]);

  // Al presionar el tacho, NO borramos, solo abrimos el modal y guardamos el ID
  const handleRequestEliminar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Evitamos que abra el historial de la card
    e.preventDefault();
    setSelectedEnvioId(id);
    setShowModal(true); // Abrimos el cartel lindo
  };

  // Esta función se ejecuta cuando el usuario confirma en el modal
  const handleConfirmEliminar = () => {
    if (!selectedEnvioId) return;

    startTransition(async () => {
      const res = await eliminarEnvio(selectedEnvioId);
      if (res.success) {
        // Actualización optimista: lo sacamos de la pantalla
        setListaEnvios((prev) => prev.filter((envio) => envio.id !== selectedEnvioId));
        setShowModal(false); // Cerramos modal
        setSelectedEnvioId(null);
      } else {
        alert(res.error);
        setShowModal(false);
      }
    });
  };

  // Función para cerrar el modal sin hacer nada
  const handleCancelEliminar = () => {
    setShowModal(false);
    setSelectedEnvioId(null);
  };

  const enviosFiltrados = listaEnvios.filter((envio) => {
    if (filtro === "entregados") return envio.estado === "ENTREGADO";
    if (filtro === "en-camino") return envio.estado === "EN CAMINO";
    return true;
  });

  return (
    <>
      {/* ── 1. EL CARTEL "MÁS LINDO" (MODAL DE CONFIRMACIÓN) ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] p-4 backdrop-blur-sm animate-in fade-in duration-300">
          {/* Contenedor del Modal */}
          <div className="bg-card text-card-foreground p-8 rounded-3xl shadow-2xl border border-border w-full max-w-lg relative scale-in-center animate-in zoom-in-95 duration-200">
            
            {/* Botón X para cerrar arriba a la derecha */}
            <button
                onClick={handleCancelEliminar}
                className="absolute top-5 right-5 text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors"
            >
                <X size={20} />
            </button>

            {/* Cabecera del Modal con icono de advertencia */}
            <div className="flex items-center gap-6 mb-6">
              <div className="bg-red-100 text-red-600 p-4 rounded-full border border-red-200">
                <AlertTriangle size={36} strokeWidth={1.5}/>
              </div>
              <div>
                <h4 className="text-2xl font-semibold text-foreground mb-1">
                  Eliminar Registro
                </h4>
                <p className="text-sm text-red-600 font-medium">
                  Atención: Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            {/* Cuerpo del Modal */}
            <p className="text-muted-foreground mb-10 text-base leading-relaxed">
              ¿Estás seguro de que querés eliminar permanentemente este registro de envío entregado? Se borrará todo el historial de eventos asociado a este paquete.
            </p>

            {/* Botones de Acción del Modal */}
            <div className="flex gap-4 items-center justify-end">
              <button
                onClick={handleCancelEliminar}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
              >
                No, cancelar
              </button>
              <button
                onClick={handleConfirmEliminar}
                disabled={isPending}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 shadow-md transition-all cursor-pointer flex items-center gap-2 ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              >
                {isPending ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                        Eliminando...
                    </>
                ) : (
                    <>
                        <div className="Trash2 size={16}" />
                        Sí, eliminar registro
                    </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── 2. BARRA DE BOTONES DE FILTRO ── */}
      <nav className="bg-secondary text-secondary-foreground px-6 md:px-10 py-3 flex items-center gap-6 overflow-x-auto shadow-sm mb-10 rounded-2xl border border-border/50">
        <button
          onClick={() => setFiltro("todos")}
          className={`text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer ${
            filtro === "todos"
              ? "bg-primary text-primary-foreground shadow-md scale-105"
              : "text-secondary-foreground/60 hover:text-secondary-foreground"
          }`}
        >
          Todos los envíos
        </button>
        <button
          onClick={() => setFiltro("en-camino")}
          className={`text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer ${
            filtro === "en-camino"
              ? "bg-primary text-primary-foreground shadow-md scale-105"
              : "text-secondary-foreground/60 hover:text-secondary-foreground"
          }`}
        >
          En Camino
        </button>
        <button
          onClick={() => setFiltro("entregados")}
          className={`text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer ${
            filtro === "entregados"
              ? "bg-primary text-primary-foreground shadow-md scale-105"
              : "text-secondary-foreground/60 hover:text-secondary-foreground"
          }`}
        >
          Entregados
        </button>
      </nav>

      {/* ── 3. LISTADO FILTRADO INTERACTIVO EN GRILLA ── */}
      {/* CAMBIO CLAVE: Usamos grid, grid-cols-1 (celulares) y lg:grid-cols-2 (PC) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {enviosFiltrados.map((envio, index) => (
          <div
            key={envio.id}
            className="relative group" // Agregamos 'group' para efectos hover en el botón
            style={{ zIndex: enviosFiltrados.length - index }}
          >
            {/* EL BOTÓN DE BORRAR: Ahora solo depende de si el estado es entregado */}
            {envio.estado === "ENTREGADO" && (
              <div className="absolute top-4 right-4 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"> 
                  <button
                    onClick={(e) => handleRequestEliminar(e, envio.id)}
                    disabled={isPending}
                    className={`p-3 bg-red-100/70 text-red-600 border border-red-200 rounded-full transition-all shadow-md cursor-pointer hover:bg-red-100 hover:scale-110 active:scale-95 ${
                      isPending ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    title="Eliminar Registro permanentemente"
                  >
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
              </div>
            )}

            <EnvioCard envio={envio} />
          </div>
        ))}

        {/* MENSAJE SI NO HAY RESULTADOS (ocupa las dos columnas) */}
        {enviosFiltrados.length === 0 && (
            <div className="col-span-1 lg:col-span-2 bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-16 text-center mt-8">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 border border-border/50">
                    <Truck className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-medium text-foreground mb-2">
                    No hay envíos
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm">
                    No encontramos registros de paquetes para la categoría seleccionada en este momento.
                </p>
            </div>
        )}
      </div>
    </>
  );
}