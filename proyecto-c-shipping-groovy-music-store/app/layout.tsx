import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { cormorant, syne, dmSans } from "@/app/fonts"; 
import "./globals.css";

export const metadata: Metadata = {
  title: "Shipping App",
  description: "Logística interna de Groovy Music Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        className={`${cormorant.variable} ${syne.variable} ${dmSans.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground font-dm">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}