import Link from "next/link";
import { Suspense } from "react";
import { EmpresasDestacadas } from "@/components/landing-destacadas";

const pasos = [
  {
    titulo: "Explora",
    texto: "Descubre empresas turísticas verificadas, con sus servicios y los horarios que tienen disponibles.",
  },
  {
    titulo: "Solicita",
    texto: "Elige un horario, indica cuántas personas son y envía tu solicitud de reserva en un par de clics.",
  },
  {
    titulo: "Recibe respuesta",
    texto: "La empresa acepta o rechaza tu solicitud y te avisa. Sigues el estado desde tu historial.",
  },
];

const beneficios = [
  {
    para: "Para turistas",
    puntos: [
      "Catálogo único de empresas verificadas",
      "Solicitud de reserva con cantidad de personas y notas",
      "Historial y estado de cada reserva",
      "Avisos cuando la empresa responde",
    ],
  },
  {
    para: "Para empresas turísticas",
    puntos: [
      "Perfil comercial con tu ubicación y categoría",
      "Publica servicios, horarios y cupos",
      "Acepta o rechaza solicitudes, con motivo",
      "Ve quién ha reservado y el detalle de cada cita",
    ],
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-100 to-cafe-50 dark:from-cafe-900 dark:to-cafe-950">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-20 text-center sm:py-28">
          <span className="rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-medium text-accent-soft-fg dark:border-cafe-700 dark:bg-cafe-900 dark:text-orange-300">
            MVP en desarrollo
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Reserva experiencias turísticas{" "}
            <span className="text-accent">sin vueltas</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cafe-600 dark:text-cafe-400">
            Conectamos a turistas con empresas verificadas para agendar actividades
            y cupos en los mejores lugares, y damos a las empresas una forma simple
            de gestionar su oferta y sus reservas.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/registro"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              Crear cuenta gratis
            </Link>
            <a
              href="#como-funciona"
              className="rounded-lg border border-cafe-300 px-6 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-accent dark:border-cafe-700"
            >
              Cómo funciona
            </a>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" aria-labelledby="como" className="scroll-mt-16 py-16">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 id="como" className="text-center text-3xl font-bold tracking-tight">
            Cómo funciona
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-cafe-600 dark:text-cafe-400">
            Tres pasos desde que encuentras una experiencia hasta que la reservas.
          </p>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {pasos.map((p, i) => (
              <li key={p.titulo} className="rounded-2xl border border-cafe-200 p-6 dark:border-cafe-800">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{p.titulo}</h3>
                <p className="mt-2 text-sm leading-6 text-cafe-600 dark:text-cafe-400">{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Empresas (datos reales de la API) */}
      <Suspense fallback={null}>
        <EmpresasDestacadas />
      </Suspense>

      {/* Para quién */}
      <section aria-labelledby="para-quien" className="py-16">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 id="para-quien" className="text-center text-3xl font-bold tracking-tight">
            Pensado para ambos lados
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {beneficios.map((b) => (
              <div key={b.para} className="rounded-2xl border border-cafe-200 p-8 dark:border-cafe-800">
                <h3 className="text-xl font-semibold">{b.para}</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {b.puntos.map((punto) => (
                    <li key={punto} className="flex gap-3 text-sm text-cafe-700 dark:text-cafe-300">
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-accent" fill="currentColor">
                        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
                      </svg>
                      {punto}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 pb-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center rounded-3xl bg-cafe-800 px-6 py-14 text-center text-white dark:bg-cafe-900">
          <h2 className="text-3xl font-bold tracking-tight">¿Listo para empezar?</h2>
          <p className="mt-3 max-w-xl text-orange-100">
            Crea tu cuenta como turista o como empresa turística. Es gratis.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/registro" className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-cafe-950 transition-colors hover:bg-orange-400">
              Registrarme
            </Link>
            <Link href="/login" className="rounded-lg border border-white/60 px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/10">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-cafe-200 px-6 py-8 text-center text-sm text-cafe-500 dark:border-cafe-800">
        Explora · Proyecto MVP
      </footer>
    </>
  );
}
