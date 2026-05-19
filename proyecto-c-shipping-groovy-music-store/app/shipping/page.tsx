import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Package,
  MapPin,
  Truck,
  History,
  Circle,
} from "lucide-react";

export default async function Home() {

  const envios = await prisma.envio.findMany({
    include: {
      direccion: true,
      empresa: true,
      eventos: true,
    },
  });

  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="flex items-center justify-between mb-10 border-b border-muted pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase">
              Panel de Envíos
            </h1>

            <p className="text-muted font-medium">
              Groovy Music Store - Logística Interna
            </p>
          </div>

          <div className="bg-card p-3 rounded-full shadow-sm border border-muted">
            <Truck
              size={32}
              className="text-foreground"
            />
          </div>
        </header>

        {/* Lista */}
        <div className="grid gap-8">

          {envios.map((envio) => (

            <Link
              key={envio.id}
              href={`/envios/${envio.id}`}
              className="
                block
                bg-card
                rounded-3xl
                shadow-lg
                border
                border-muted
                overflow-hidden
                transition-all
                hover:shadow-xl
                hover:-translate-y-1
                hover:border-foreground/20
              "
            >

              <div className="md:flex">

                {/* Sidebar */}
                <div className="
                  bg-background/50
                  p-6
                  md:w-64
                  flex
                  flex-col
                  justify-between
                  border-r
                  border-muted/30
                ">

                  <div>
                    <span className="
                      text-xs
                      uppercase
                      tracking-widest
                      text-muted
                    ">
                      Orden ID
                    </span>

                    <p className="
                      text-xl
                      font-mono
                      font-bold
                      leading-none
                      mt-1
                    ">
                      {envio.order_id}
                    </p>
                  </div>

                  <div className="mt-8">
                    <span className="
                      inline-flex
                      items-center
                      gap-2
                      bg-accent
                      px-3
                      py-1
                      rounded-full
                      text-sm
                      font-bold
                      uppercase
                      border
                      border-muted/50
                    ">
                      <Circle
                        size={10}
                        fill="currentColor"
                      />

                      {envio.estado}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 text-card-foreground">

                  <div className="grid md:grid-cols-2 gap-8">

                    {/* Datos */}
                    <div className="space-y-4">

                      <div className="flex items-start gap-3">
                        <Package
                          className="text-muted mt-1"
                          size={20}
                        />

                        <div>
                          <p className="
                            text-xs
                            text-muted
                            font-bold
                            uppercase
                          ">
                            Operador Logístico
                          </p>

                          <p className="font-semibold text-lg">
                            {envio.empresa.nombre}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin
                          className="text-muted mt-1"
                          size={20}
                        />

                        <div>
                          <p className="
                            text-xs
                            text-muted
                            font-bold
                            uppercase
                          ">
                            Destino de Entrega
                          </p>

                          <p className="font-medium">
                            {envio.direccion.calle},{" "}
                            {envio.direccion.ciudad}
                          </p>

                          <p className="text-sm text-muted">
                            CP {envio.direccion.cod_postal} —{" "}
                            {envio.direccion.provincia}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="
                      bg-background/30
                      p-5
                      rounded-2xl
                      border
                      border-muted/50
                    ">

                      <h3 className="
                        text-sm
                        font-black
                        uppercase
                        mb-4
                        flex
                        items-center
                        gap-2
                      ">
                        <History
                          size={16}
                          className="text-muted"
                        />

                        Historial de Movimientos
                      </h3>

                      <ul className="space-y-3 relative">

                        {envio.eventos.map((evento, index) => (

                          <li
                            key={evento.id}
                            className="
                              flex
                              gap-3
                              text-sm
                              items-start
                            "
                          >

                            <div className="
                              relative
                              flex
                              flex-col
                              items-center
                            ">

                              <div
                                className={`
                                  w-2
                                  h-2
                                  rounded-full
                                  mt-1.5
                                  ${
                                    index === 0
                                      ? "bg-foreground"
                                      : "bg-muted"
                                  }
                                `}
                              />

                              {index !== envio.eventos.length - 1 && (
                                <div className="
                                  w-px
                                  h-full
                                  bg-muted
                                  absolute
                                  top-3
                                " />
                              )}
                            </div>

                            <span
                              className={
                                index === 0
                                  ? "font-bold"
                                  : "text-muted"
                              }
                            >
                              {evento.descripcion}
                            </span>

                          </li>
                        ))}

                      </ul>
                    </div>

                  </div>
                </div>
              </div>
            </Link>
          ))}

        </div>
      </div>
    </main>
  );
}