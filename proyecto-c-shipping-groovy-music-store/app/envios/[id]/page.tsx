import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Package, MapPin, Truck, History } from "lucide-react";
import { normalizarEstado } from "@/lib/utils";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EnvioPage({ params }: Props) {

  const { id } = await params;

  const envioRaw = await prisma.envio.findUnique({
    where: {
      id: id,
    },
    include: {
      direccion: true,
      empresa: true,
      eventos: {
        orderBy: {
          timestamp: "desc",
        },
      },
    },
  });

  if (!envioRaw) {
    notFound();
  }

  const envio = {
    ...envioRaw,
    estado: normalizarEstado(envioRaw.estado),
  };

  return (
    <main className="min-h-screen p-10">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <p className="text-sm text-muted">
            Envío
          </p>

          <h1 className="text-4xl font-black mt-2">
            {envio.order_id}
          </h1>
        </div>

        <div className="grid gap-6">

          <div className="bg-card border border-muted rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Truck />
              <h2 className="text-2xl font-bold">
                Estado Actual
              </h2>
            </div>

            <p className="text-xl font-semibold">
              {envio.estado}
            </p>
          </div>

          <div className="bg-card border border-muted rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package />
              <h2 className="text-2xl font-bold">
                Empresa
              </h2>
            </div>

            <p className="text-lg">
              {envio.empresa.nombre}
            </p>
          </div>

          <div className="bg-card border border-muted rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin />
              <h2 className="text-2xl font-bold">
                Dirección de Entrega
              </h2>
            </div>

            <div className="space-y-1">
              <p>{envio.direccion.calle}</p>
              <p>{envio.direccion.ciudad}</p>
              <p>{envio.direccion.provincia}</p>
              <p>{envio.direccion.cod_postal}</p>
              <p>{envio.direccion.pais}</p>
            </div>
          </div>

          <div className="bg-card border border-muted rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <History />
              <h2 className="text-2xl font-bold">
                Historial
              </h2>
            </div>

            <div className="space-y-4">
              {envio.eventos.map((evento) => (
                <div
                  key={evento.id}
                  className="border-l-2 border-muted pl-4"
                >
                  <p className="font-semibold">
                    {evento.descripcion}
                  </p>

                  <p className="text-sm text-muted">
                    {new Date(evento.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}