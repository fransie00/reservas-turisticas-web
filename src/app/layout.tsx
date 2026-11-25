import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
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
  title: "Reservas Turísticas",
  description: "Encuentra y reserva tu próxima experiencia turística",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
          <Link href="/" className="font-bold">Reservas Turísticas</Link>
          <Suspense fallback={<div className="h-6 w-40" />}>
            <NavUser />
          </Suspense>
        </header>
        {children}
      </body>
    </html>
  );
}
