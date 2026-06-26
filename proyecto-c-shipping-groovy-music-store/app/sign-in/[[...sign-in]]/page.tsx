import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
   
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SignIn
        appearance={{
          variables: {
            
            colorPrimary: "var(--primary)",       
            colorBackground: "var(--card)",       
            colorText: "var(--foreground)",       
            colorDanger: "var(--accent)",         
          },
          elements: {
           
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