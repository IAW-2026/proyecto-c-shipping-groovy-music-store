"use client";

import { useState } from "react";
import { Package, MapPin, History, ChevronDown, Check, Truck } from "lucide-react";

// Los estados válidos de tu sistema
const ESTADOS = ["EN PREPARACIÓN", "EN CAMINO", "ENTREGADO"] as const;

export default function EnvioCard({ envio }: { envio: any }) {
  // Estados visuales e interactivos
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [estadoActual, setEstadoActual] = useState(envio.estado);
  const [eventosActuales, setEventosActuales] = useState(envio.eventos || []);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calcula el porcentaje de la barra de progreso
  const indiceEstado = ESTADOS.indexOf(estadoActual);
  const porcentajeBarra =
    indiceEstado === 0 ? "0%" : indiceEstado === 1 ? "50%" : "100%";

  // Función para cambiar el estado (Actualización optimista)
  const handleCambiarEstado = async (e: React.MouseEvent, nuevoEstado: string) => {
    e.stopPropagation();
    if (nuevoEstado === estadoActual || isUpdating) return;

    setIsUpdating(true);
    const estadoAnterior = estadoActual;
    const eventosAnteriores = [...eventosActuales];

    // 1. Actualización visual instantánea (Optimista)
    setEstadoActual(nuevoEstado);
    const nuevoEvento = {
      id: `temp-${Date.now()}`,
      descripcion: nuevoEstado,
      timestamp: new Date().toISOString(),
    };
    setEventosActuales([nuevoEvento, ...eventosActuales]);

    try {
      // 2. Llamada a tu API o Server Action
      // Mantenemos envio.id acá porque la base de datos necesita el UUID para actualizar
      const res = await fetch(`/api/envios/${envio.id}/estado`, {
        method: "PATCH", // o POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) {
        throw new Error("Falló la actualización en la BD");
      }
    } catch (error) {
      // 3. Si falla, revertimos a como estaba antes y avisamos
      console.error(error);
      alert("Hubo un error al actualizar el estado. Volviendo al estado anterior.");
      setEstadoActual(estadoAnterior);
      setEventosActuales(eventosAnteriores);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-6 transition-all hover:shadow-md relative overflow-hidden">
      
      {/* ── ENCABEZADO DE LA TARJETA ── */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="text-primary" size={20} />
            {/* ACÁ MOSTRAMOS EL CÓDIGO DE SEGUIMIENTO */}
            <h3 className="font-bold text-lg font-mono tracking-tight">
              {envio.codigo_seguimiento}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Código de seguimiento
          </p>
        </div>

        {/* Botones rápidos para cambiar de estado */}
        <div className="flex gap-2 relative z-20">
          {ESTADOS.map((estado) => (
            <button
              key={estado}
              onClick={(e) => handleCambiarEstado(e, estado)}
              disabled={isUpdating}
              className={`text-[10px] sm:text-xs font-bold uppercase px-3 py-1.5 rounded-full transition-all border ${
                estadoActual === estado
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {estado}
            </button>
          ))}
        </div>
      </div>

      {/* ── LA BARRA DE PROGRESO ── */}
      <div className="mb-8 mt-4 px-2">
        <div className="relative h-2 w-full bg-muted rounded-full overflow-visible">
          {/* Línea que se llena */}
          <div
            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: porcentajeBarra }}
          ></div>

          {/* Puntos (Nodos) de la barra */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-4 h-4 bg-background border-2 border-primary rounded-full z-10"></div>
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full z-10"></div>
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-4 h-4 bg-background border-2 border-primary rounded-full z-10 flex items-center justify-center">
            {estadoActual === "ENTREGADO" && <Check size={10} className="text-primary" />}
          </div>
        </div>
        <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground mt-3">
          <span className={indiceEstado >= 0 ? "text-primary" : ""}>Preparación</span>
          <span className={indiceEstado >= 1 ? "text-primary" : ""}>En Camino</span>
          <span className={indiceEstado === 2 ? "text-primary" : ""}>Entregado</span>
        </div>
      </div>

      {/* ── DATOS DE DIRECCIÓN Y EMPRESA ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
          <MapPin className="text-muted-foreground mt-0.5" size={18} />
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase mb-0.5">Destino</p>
            <p className="text-sm font-medium">{envio.direccion?.calle}</p>
            <p className="text-xs text-muted-foreground">
              {envio.direccion?.ciudad}, {envio.direccion?.provincia}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
          <Truck className="text-muted-foreground mt-0.5" size={18} />
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase mb-0.5">Operador</p>
            <p className="text-sm font-medium">{envio.empresa?.nombre}</p>
            <p className="text-xs text-muted-foreground">Asignado al envío</p>
          </div>
        </div>
      </div>

      {/* ── BOTÓN PARA DESPLEGAR HISTORIAL ── */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMostrarHistorial(!mostrarHistorial);
        }}
        className="w-full flex items-center justify-between py-3 px-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors border border-border/50 cursor-pointer relative z-20"
      >
        <div className="flex items-center gap-2">
          <History size={16} className="text-primary" />
          <span className="text-sm font-semibold">Historial de movimientos</span>
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${
            mostrarHistorial ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ── HISTORIAL DESPLEGABLE ── */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          mostrarHistorial ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-l-2 border-border ml-6 space-y-4 py-2 relative z-20">
          {eventosActuales.map((evento: any, index: number) => (
            <div key={evento.id} className="relative pl-6">
              {/* Puntito en la línea temporal */}
              <div
                className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 ${
                  index === 0
                    ? "bg-primary animate-pulse" // El último evento titila
                    : "bg-muted-foreground"
                }`}
              ></div>
              <p className="text-sm font-semibold text-foreground uppercase tracking-wide">
                {evento.descripcion}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(evento.timestamp).toLocaleString("es-AR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          ))}
          {eventosActuales.length === 0 && (
            <p className="pl-6 text-sm text-muted-foreground">
              No hay eventos registrados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}