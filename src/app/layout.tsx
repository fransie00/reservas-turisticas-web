import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { NavUser } from "@/components/nav-user";
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
  title: { default: "Explora · Reservas turísticas", template: "%s · Explora" },
  description: "Explora conecta turistas con empresas turísticas verificadas para reservar experiencias.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-cafe-200 px-6 py-3 dark:border-cafe-800">
          <Link href="/" aria-label="Explora, ir al inicio"><Logo /></Link>
          <Suspense fallback={<div className="h-6 w-40" />}>
            <NavUser />
          </Suspense>
        </header>
        {children}
      </body>
    </html>
  );
}
