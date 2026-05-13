import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="es">
      {/* Aplicamos el fondo y color de texto a TODO el sitio web */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#e3e9ea] text-[#4e5d66]`}
      >
        {children}
      </body>
    </html>
  );
}