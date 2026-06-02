// app/shipping/nuevo/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FormularioNuevoEnvio from "@/app/componentes/FormularioNuevoEnvio";

export default async function NuevoEnvioPage() {
  // Protección: solo admins
  const user = await getCurrentUser();
  if (!user) redirect("/no-autorizado");
  if (user.role !== "ADMIN") redirect("/no-autorizado");

  // Traemos las empresas para el selector
  const empresas = await prisma.empresa.findMany({
    select: { id: true, nombre: true },
  });

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      {/* HEADER */}
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
      </header>

      <div className="max-w-2xl mx-auto px-6 md:px-10 pt-12">
        {/* TÍTULO */}
        <div className="mb-10">
          <h2 className="text-4xl font-medium text-foreground mb-3">
            Nuevo Envío
          </h2>
          <p className="text-muted-foreground">
            Completá los datos para registrar un nuevo envío en el sistema.
          </p>
          <div className="w-16 h-1 bg-primary mt-6" />
        </div>

        <FormularioNuevoEnvio empresas={empresas} />
      </div>
    </main>
  );
}