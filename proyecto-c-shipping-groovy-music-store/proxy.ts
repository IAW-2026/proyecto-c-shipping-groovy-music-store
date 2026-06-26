import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/no-autorizado",
  "/api/(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/shipping/nuevo",
]);

const isShippingRoute = createRouteMatcher([
  "/shipping(.*)",
]);

function esRolAdmin(role: string | undefined | null): boolean {
  return role === "admin" || role === "super_admin";
}

function tieneAcceso(role: string | undefined | null): boolean {
  return role === "admin" || role === "super_admin" || role === "operador";
}

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // protect() devuelve los claims directamente
  const { sessionClaims } = await auth.protect();

  console.log("SESSION CLAIMS:", JSON.stringify(sessionClaims));
  const roles = sessionClaims?.roles as string[] | undefined;
  const role = roles?.[0];
  console.log("ROL LEÍDO:", role);
  console.log("RUTA:", req.nextUrl.pathname);

  if (isAdminRoute(req)) {
    if (!esRolAdmin(role)) {
      return NextResponse.redirect(new URL("/no-autorizado", req.url));
    }
  }

  if (isShippingRoute(req)) {
    if (!tieneAcceso(role)) {
      return NextResponse.redirect(new URL("/no-autorizado", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};