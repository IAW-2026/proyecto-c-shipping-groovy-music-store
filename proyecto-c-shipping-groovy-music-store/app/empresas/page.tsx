import { prisma } from "@/lib/prisma";

export default async function EmpresasPage() {
  const empresas = await prisma.empresa.findMany();

  return (
    <div>
      <h1>Empresas</h1>

      {empresas.map((empresa) => (
        <div key={empresa.id}>
          <h2>{empresa.nombre}</h2>
        </div>
      ))}
    </div>
  );
}