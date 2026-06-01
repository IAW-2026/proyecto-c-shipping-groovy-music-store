import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { normalizarEstado } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, Truck, Calendar, Hash, User } from "lucide-react";

export default async function DetalleEnvioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) redirect("/no-autorizado");

  const isAdmin = user.role === "ADMIN";

  const envio = await prisma.envio.findUnique({
    where: { id },
    include: {
      direccion: true,
      empresa: true,
      eventos: {
        orderBy: { timestamp: "desc" },
      },
    },
  });

  if (!envio) notFound();

  // El operador no puede ver envíos de otra empresa
  if (!isAdmin && envio.empresaId !== user.empresaId) redirect("/no-autorizado");

  const estado = normalizarEstado(envio.estado);

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      {/* ── HEADER ── */}
      <header className="bg-primary text-primary-foreground py-4 px-6 md:px-10 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <h1
            className="leading-none tracking-[0.08em] uppercase text-primary-foreground"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            }}
          >
            Groovy
          </h1>
          <span
            className="hidden md:inline-block text-primary-foreground/70 text-xs font-medium tracking-[0.3em] border-l border-primary-foreground/30 pl-4 ml-2 uppercase"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Shipping
          </span>
        </div>
        <div className="flex items-center gap-3 pl-4 border-l border-primary-foreground/30">
          <div
            className="hidden sm:flex items-center text-xs font-semibold bg-primary-foreground/20 px-3 py-1 rounded-full uppercase tracking-wider"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {isAdmin ? "Admin" : "Operador"}
          </div>
          <UserButton
            appearance={{
              elements: { avatarBox: "w-9 h-9 border-2 border-primary-foreground/50" },
            }}
          />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-10">

        {/* VOLVER */}
        <Link
          href="/shipping"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Volver al panel
        </Link>

        {/* TÍTULO */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Package className="text-primary" size={24} />
            <h2 className="text-3xl font-bold font-mono tracking-tight">
              {envio.codigo_seguimiento}
            </h2>
          </div>
          <p className="text-muted-foreground text-sm uppercase tracking-wider">
            Detalle del envío
          </p>
          <div className="w-16 h-1 bg-primary mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ESTADO ACTUAL */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Estado actual
            </p>
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-bold uppercase tracking-wider">
              {estado}
            </span>
          </div>

          {/* EMPRESA */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Empresa logística
            </p>
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-primary" />
              <span className="font-semibold">{envio.empresa?.nombre}</span>
            </div>
          </div>

          {/* DIRECCIÓN */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Dirección de entrega
            </p>
            <div className="flex items-start gap-2">
              <MapPin size={18} className="text-primary mt-0.5" />
              <div>
                <p className="font-semibold">{envio.direccion?.calle}</p>
                <p className="text-sm text-muted-foreground">
                  {envio.direccion?.ciudad}, {envio.direccion?.provincia}
                </p>
                <p className="text-sm text-muted-foreground">
                  CP {envio.direccion?.cod_postal} — {envio.direccion?.pais}
                </p>
              </div>
            </div>
          </div>

          {/* FECHA ESTIMADA */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Fecha de entrega estimada
            </p>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <span className="font-semibold">
                {envio.fecha_entrega_estimada
                  ? new Date(envio.fecha_entrega_estimada).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Sin fecha estimada"}
              </span>
            </div>
          </div>

          {/* IDs */}
          <div className="bg-card border border-border rounded-2xl p-6 md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Identificadores
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Hash size={12} /> Order ID
                </p>
                <p className="text-sm font-mono break-all">{envio.order_id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <User size={12} /> Seller ID
                </p>
                <p className="text-sm font-mono break-all">{envio.seller_id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <User size={12} /> Buyer ID
                </p>
                <p className="text-sm font-mono break-all">{envio.buyer_id}</p>
              </div>
            </div>
          </div>

          {/* HISTORIAL */}
          <div className="bg-card border border-border rounded-2xl p-6 md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">
              Historial de movimientos
            </p>
            <div className="border-l-2 border-border ml-4 space-y-4">
              {envio.eventos.map((evento, index) => (
                <div key={evento.id} className="relative pl-6">
                  <div
                    className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 ${
                      index === 0 ? "bg-primary animate-pulse" : "bg-muted-foreground"
                    }`}
                  />
                  <p className="text-sm font-semibold uppercase tracking-wide">
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
              {envio.eventos.length === 0 && (
                <p className="pl-6 text-sm text-muted-foreground">
                  No hay eventos registrados.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}