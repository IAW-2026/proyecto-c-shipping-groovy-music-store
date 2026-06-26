import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

export default function NoAutorizado() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl font-bold text-foreground mb-4">🚫</h1>
      <h2 className="text-2xl font-semibold mb-3">Sin acceso</h2>
      <p className="text-muted-foreground text-base max-w-md mb-8">
        Tu cuenta no tiene permisos para acceder al panel de Shipping. 
        Contactá a un administrador para que te agregue al sistema.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Si quiere probar con otra cuenta */}
        <SignOutButton redirectUrl="/sign-in">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all">
            Iniciar sesión con otra cuenta
          </button>
        </SignOutButton>

        {/* Si quiere volver al inicio */}
        <Link
          href="/"
          className="px-6 py-3 border border-border text-foreground rounded-xl font-semibold hover:bg-muted transition-all"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}