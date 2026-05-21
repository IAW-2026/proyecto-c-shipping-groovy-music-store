import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    // Agregamos bg-[#fff5f7] acá para que el fondo no quede blanco y la tarjeta resalte
    <div className="flex min-h-screen items-center justify-center bg-[#fff5f7] p-4">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#ee6969", 
            colorBackground: "#ffffff", 
            colorText: "#1a0b0e", 
            colorDanger: "#af273e", 
          },
          elements: {
            card: "shadow-2xl rounded-3xl border border-[#f4c1c1]", 
            headerTitle: "text-2xl font-bold",
            headerSubtitle: "text-[#4a2b32]",
            socialButtonsBlockButton: "hover:bg-[#fff5f7] border-[#f4c1c1]",
            formFieldInput: "rounded-xl focus:ring-[#ee6969] focus:border-[#ee6969]",
          },
        }}
      />
    </div>
  );
}
