import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { normalizarEstado } from "@/lib/utils";

export default async function AdminPage() {
  // El middleware ya bloqueó no-admins, esto es fallback
  const user = await getCurrentUser();
  if (!user) redirect("/no-autorizado");

  const empresas = await prisma.empresa.findMany({
    orderBy: { nombre: "asc" },
    include: { envios: true },
  });

  const hoy = new Date();

  const filas = empresas.map((empresa) => {
    let total = 0;
    let enPreparacion = 0;
    let enCamino = 0;
    let entregados = 0;
    let demorados = 0;

    for (const envio of empresa.envios) {
      total++;
      const estado = normalizarEstado(envio.estado);
      if (estado === "EN PREPARACIÓN") enPreparacion++;
      if (estado === "EN CAMINO") enCamino++;
      if (estado === "ENTREGADO") entregados++;
      if (
        estado !== "ENTREGADO" &&
        envio.fecha_entrega_estimada &&
        new Date(envio.fecha_entrega_estimada) < hoy
      ) {
        demorados++;
      }
    }

    const porcentajeEntregado = total === 0 ? 0 : Math.round((entregados / total) * 100);

    return {
      id: empresa.id,
      nombre: empresa.nombre,
      total,
      enPreparacion,
      enCamino,
      entregados,
      demorados,
      porcentajeEntregado,
    };
  });

  const totales = filas.reduce(
    (acc, f) => ({
      total: acc.total + f.total,
      enPreparacion: acc.enPreparacion + f.enPreparacion,
      enCamino: acc.enCamino + f.enCamino,
      entregados: acc.entregados + f.entregados,
      demorados: acc.demorados + f.demorados,
    }),
    { total: 0, enPreparacion: 0, enCamino: 0, entregados: 0, demorados: 0 }
  );
  const porcentajeEntregadoGlobal =
    totales.total === 0 ? 0 : Math.round((totales.entregados / totales.total) * 100);

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
            Shipping · Admin
          </span>
        </div>
        <div className="flex items-center gap-3 pl-4 border-l border-primary-foreground/60">
          <div
            className="hidden sm:flex items-center text-xs font-semibold bg-black/30 px-3 py-1 rounded-full uppercase tracking-wider"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Admin
          </div>
          <UserButton
            appearance={{
              elements: { avatarBox: "w-9 h-9 border-2 border-primary-foreground/50" },
            }}
          />
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-10">
        {/* VOLVER */}
        <Link
          href="/shipping"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Volver al panel operativo
        </Link>

        {/* TÍTULO */}
        <div className="mb-10">
          <h2 className="text-4xl md:text-5xl font-medium text-foreground mb-3">
            Reporte por empresa
          </h2>
          <p className="text-muted-foreground text-lg">
            Resumen de envíos gestionados por cada operador logístico.
          </p>
          <div className="w-16 h-1 bg-primary mt-6" />
        </div>

        {/* TABLA */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Envíos por empresa">
              <thead className="bg-secondary/30 text-muted-foreground uppercase text-xs tracking-wider">
                <tr>
                  <th scope="col" className="text-left px-6 py-4 font-semibold">Empresa</th>
                  <th scope="col" className="text-right px-4 py-4 font-semibold">Total</th>
                  <th scope="col" className="text-right px-4 py-4 font-semibold">En preparación</th>
                  <th scope="col" className="text-right px-4 py-4 font-semibold">En camino</th>
                  <th scope="col" className="text-right px-4 py-4 font-semibold">Entregados</th>
                  <th scope="col" className="text-right px-4 py-4 font-semibold">Demorados</th>
                  <th scope="col" className="text-right px-6 py-4 font-semibold">% Entregado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filas.map((f) => (
                  <tr key={f.id} className="hover:bg-secondary/20 transition-colors">
                    <th scope="row" className="text-left px-6 py-4 font-semibold text-foreground">
                      {f.nombre}
                    </th>
                    <td className="text-right px-4 py-4 font-mono">{f.total}</td>
                    <td className="text-right px-4 py-4 font-mono text-muted-foreground">{f.enPreparacion}</td>
                    <td className="text-right px-4 py-4 font-mono text-muted-foreground">{f.enCamino}</td>
                    <td className="text-right px-4 py-4 font-mono text-muted-foreground">{f.entregados}</td>
                    <td className={`text-right px-4 py-4 font-mono font-semibold ${f.demorados > 0 ? "text-red-600" : "text-muted-foreground"}`}>
                      {f.demorados}
                    </td>
                    <td className="text-right px-6 py-4 font-mono font-bold text-primary">
                      {f.porcentajeEntregado}%
                    </td>
                  </tr>
                ))}
                {filas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No hay empresas cargadas.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-secondary/40 border-t border-border">
                <tr className="font-bold">
                  <th scope="row" className="text-left px-6 py-4 uppercase tracking-wider text-xs">
                    Total general
                  </th>
                  <td className="text-right px-4 py-4 font-mono">{totales.total}</td>
                  <td className="text-right px-4 py-4 font-mono">{totales.enPreparacion}</td>
                  <td className="text-right px-4 py-4 font-mono">{totales.enCamino}</td>
                  <td className="text-right px-4 py-4 font-mono">{totales.entregados}</td>
                  <td className={`text-right px-4 py-4 font-mono ${totales.demorados > 0 ? "text-red-600" : ""}`}>
                    {totales.demorados}
                  </td>
                  <td className="text-right px-6 py-4 font-mono text-foreground">
                    {porcentajeEntregadoGlobal}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Un envío se considera <strong>demorado</strong> cuando su fecha estimada ya pasó y el estado actual no es <em>Entregado</em>.
        </p>
      </div>
    </main>
  );
}