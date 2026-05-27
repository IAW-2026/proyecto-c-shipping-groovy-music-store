import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    // Cambiamos el hex estático por tu clase bg-background (que ahora es tu retro beige)
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SignIn
        appearance={{
          variables: {
            // Enganchamos las variables de Clerk directamente a tus variables de CSS
            colorPrimary: "var(--primary)",       // El terracota
            colorBackground: "var(--card)",       // El fondo del panel
            colorText: "var(--foreground)",       // El texto oscuro
            colorDanger: "var(--accent)",         // Usamos tu color de acento para errores
          },
          elements: {
            // Usamos tus clases dinámicas de Tailwind (border-border, text-muted-foreground, etc.)
            card: "shadow-2xl rounded-3xl border border-border", 
            headerTitle: "text-2xl font-bold text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "hover:bg-muted border-border text-foreground",
            formFieldInput: "rounded-xl focus:ring-ring focus:border-ring bg-background text-foreground border-border",
          },
        }}
      />
    </div>
  );
}