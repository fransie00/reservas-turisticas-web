import { DM_Sans, Fraunces } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { BotonReservar } from "@/components/boton-reservar";
import { DashboardCargando } from "@/components/role-dashboard";
import { getCurrentUser } from "@/lib/dal";
import { formatoFecha } from "@/lib/formato";
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
  const [res, user] = await Promise.all([listarLugares(), getCurrentUser()]);
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
          {l.imagenes[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={l.imagenes[0].url} alt="" className="h-56 w-full object-cover" loading="lazy" />
          )}
          <div className="flex flex-1 flex-col p-6">
            <p className="text-xs uppercase tracking-widest text-cafe-500 dark:text-cafe-300">{l.ciudad} · {l.empresa.nombre_comercial}</p>
            <h2 className="font-display mt-1 text-2xl font-semibold">
              <Link href={`/lugares/${l.id}`} className="hover:underline">{l.nombre}</Link>
            </h2>
            <p className="mt-2 line-clamp-4 text-cafe-600 dark:text-cafe-300">{l.descripcion}</p>
            <div className="flex-1">
              <dl className="mt-4 flex flex-col gap-3 border-t border-cafe-200 pt-4 text-sm dark:border-cafe-800">
                <Dato titulo="Próxima fecha disponible" icono={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}>
                  {l.proxima_fecha ? formatoFecha(l.proxima_fecha) : "Sin horarios publicados"}
                </Dato>
                <Dato titulo="Ubicación" icono={<><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>}>
                  {l.direccion}, {l.ciudad}
                </Dato>
              </dl>
            </div>
            <div className="mt-4 flex justify-end empty:hidden">
              <BotonReservar lugarId={l.id} rol={user?.rol} />
            </div>
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
