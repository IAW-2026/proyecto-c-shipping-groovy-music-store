import { prisma } from "@/lib/prisma";

// Asigna una empresa determinística según el CP de destino.
// El mismo CP siempre devuelve la misma empresa.
export async function asignarEmpresaPorCp(destinoCp: string | number) {
  const empresas = await prisma.empresa.findMany({
    orderBy: { nombre: "asc" }, // orden fijo alfabético
    select: { id: true, nombre: true },
  });

  if (empresas.length === 0) return null;

  const cpNumerico = typeof destinoCp === "string" ? parseInt(destinoCp, 10) || 0 : destinoCp;
  const indice = cpNumerico % empresas.length;

  return empresas[indice];
}