import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const shipments = await prisma.empresa.findMany();

  return NextResponse.json(shipments);
}