import { DM_Sans, Fraunces } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { BOTON_RESERVAR } from "@/components/estilos";
import { ReservaModal } from "@/components/reserva-modal";
import { DashboardCargando } from "@/components/role-dashboard";
import { Contacto, ServiciosLugar } from "@/components/servicios-lugar";
import { listarLugares } from "@/lib/lugares";

export const metadata = { title: "Lugares turísticos" };

const texto = DM_Sans({ subsets: ["latin"] });
const titulos = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export default function LugaresPage() {
  return (
    <main className={`${texto.className} ${titulos.variable} w-full flex-1`}>
      <header className="bg-linear-to-br from-accent-soft to-background">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:px-16">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-accent">Explora</p>
          <h1 className="font-display mt-4 max-w-3xl text-5xl font-semibold leading-[0.95] md:text-7xl">
            Reserva tu hora en los lugares que quieres conocer.
          </h1>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-6 py-12 md:px-16">
        <Suspense fallback={<DashboardCargando />}>
          <Catalogo />
        </Suspense>
      </div>
    </main>
  );
}

async function Catalogo() {
  const res = await listarLugares();
  if (!res.ok) {
    return <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar el catálogo: {res.error}</p>;
  }
  if (res.data.length === 0) {
    return <p className="text-cafe-500">Aún no hay lugares disponibles. Vuelve pronto.</p>;
  }

  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {res.data.map((l) => (
        <li key={l.id} className="flex flex-col overflow-hidden rounded-2xl border border-cafe-200 bg-white shadow-xl shadow-cafe-900/5 dark:border-cafe-800 dark:bg-cafe-900">
          {l.imagenes[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={l.imagenes[0].url} alt={`Fotografía de ${l.nombre}`} className="h-56 w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-cafe-100 text-sm text-cafe-500 dark:bg-cafe-800 dark:text-cafe-300">
              Sin fotografía
            </div>
          )}
          <div className="flex flex-1 flex-col p-6">
            <p className="text-xs uppercase tracking-widest text-cafe-500 dark:text-cafe-300">{l.ciudad}</p>
            <h2 className="font-display mt-1 text-2xl font-semibold">
              <Link href={`/lugares/${l.id}`} className="hover:underline">{l.nombre}</Link>
            </h2>
            <div className="mt-4">
              <ServiciosLugar servicios={l.servicios} />
            </div>
            <div className="flex-1">
              <dl className="mt-4 flex flex-col gap-3 border-t border-cafe-200 pt-4 text-sm dark:border-cafe-800">
                <Dato titulo="Ubicación" icono={<><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>}>
                  {l.direccion}, {l.ciudad}
                </Dato>
                <Dato titulo="Contactos" icono={<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>}>
                  <Contacto contacto={l.empresa.contacto} />
                </Dato>
              </dl>
            </div>
            {l.servicios.length > 0 && (
              <div className="mt-4 flex justify-end">
                <ReservaModal lugarId={l.id} className={BOTON_RESERVAR} />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Dato({ titulo, icono, children }: { titulo: string; icono: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 size-4 shrink-0 text-accent">
        {icono}
      </svg>
      <div>
        <dt className="text-xs uppercase tracking-widest text-cafe-500 dark:text-cafe-300">{titulo}</dt>
        <dd>{children}</dd>
      </div>
    </div>
  );
}
