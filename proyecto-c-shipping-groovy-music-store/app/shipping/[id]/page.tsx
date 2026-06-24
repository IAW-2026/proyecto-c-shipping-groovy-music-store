import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { esAdmin } from "@/lib/roles";
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

  // El middleware ya protegió, esto es fallback
  if (!user) redirect("/no-autorizado");

  const isAdmin = esAdmin(user.role);

  const envio = await prisma.envio.findUnique({
    where: { id },
    include: {
      direccionDestino: true,
      direccionOrigen: true,
      empresa: true,
      eventos: { orderBy: { timestamp: "desc" } },
    },
  });

  if (!envio) notFound();
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
            className="hidden md:inline-block text-primary-foreground text-xs font-medium tracking-[0.3em] border-l border-primary-foreground/60 pl-4 ml-2 uppercase"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Shipping
          </span>
        </div>
        <div className="flex items-center gap-3 pl-4 border-l border-primary-foreground/60">
          <div
            className="hidden sm:flex items-center text-xs font-semibold bg-black/30 px-3 py-1 rounded-full uppercase tracking-wider"
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

          {/* DIRECCIÓN DESTINO */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Dirección de entrega
            </p>
            <div className="flex items-start gap-2">
              <MapPin size={18} className="text-primary mt-0.5" />
              <div>
                <p className="font-semibold">{envio.direccionDestino?.calle}</p>
                <p className="text-sm text-muted-foreground">
                  {envio.direccionDestino?.ciudad}, {envio.direccionDestino?.provincia}
                </p>
                <p className="text-sm text-muted-foreground">
                  CP {envio.direccionDestino?.cod_postal} — {envio.direccionDestino?.pais}
                </p>
              </div>
            </div>
          </div>

          {/* DIRECCIÓN ORIGEN — solo si existe */}
          {envio.direccionOrigen && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Dirección de origen
              </p>
              <div className="flex items-start gap-2">
                <MapPin size={18} className="text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold">{envio.direccionOrigen.calle}</p>
                  <p className="text-sm text-muted-foreground">
                    {envio.direccionOrigen.ciudad}, {envio.direccionOrigen.provincia}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CP {envio.direccionOrigen.cod_postal} — {envio.direccionOrigen.pais}
                  </p>
                </div>
              </div>
            </div>
          )}

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
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Sin fecha"}
              </span>
            </div>
          </div>

          {/* IDs */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Identificadores
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Hash size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground">Orden:</span>
              <span className="font-mono text-xs">{envio.order_id}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground">Seller:</span>
              <span className="font-mono text-xs">{envio.seller_id}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground">Buyer:</span>
              <span className="font-mono text-xs">{envio.buyer_id}</span>
            </div>
          </div>
        </div>

        {/* HISTORIAL */}
        {envio.eventos.length > 0 && (
          <div className="mt-8 bg-card border border-border rounded-2xl p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Historial de eventos
            </p>
            <div className="space-y-3">
              {envio.eventos.map((evento) => (
                <div key={evento.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p>{evento.descripcion}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(evento.timestamp).toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}