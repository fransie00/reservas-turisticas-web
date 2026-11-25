import Link from "next/link";
import { listarEmpresasVerificadas } from "@/lib/empresas";

/** Hasta tres empresas verificadas. Si la API no responde o no hay empresas, la sección no se muestra. */
export async function EmpresasDestacadas() {
  const res = await listarEmpresasVerificadas();
  if (!res.ok || res.data.length === 0) return null;

  return (
    <section aria-labelledby="destacadas" className="bg-cafe-50 py-16 dark:bg-cafe-900/50">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="destacadas" className="text-3xl font-bold tracking-tight">
              Empresas que ya forman parte
            </h2>
            <p className="mt-2 max-w-xl text-cafe-600 dark:text-cafe-400">
              Todas están verificadas por nuestro equipo antes de aparecer en el catálogo.
            </p>
          </div>
          <Link href="/registro" className="text-sm font-semibold text-accent hover:underline">
            Crea tu cuenta para ver todas →
          </Link>
        </div>

        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {res.data.slice(0, 3).map((e) => (
            <li
              key={e.id}
              className="flex flex-col rounded-2xl border border-cafe-200 bg-white p-6 shadow-sm dark:border-cafe-800 dark:bg-cafe-950"
            >
              <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-soft-fg">
                {e.categoria}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{e.nombre_comercial}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-cafe-500">
                <PinIcon />
                {e.ciudad}
              </p>
              {e.descripcion && (
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-cafe-600 dark:text-cafe-400">
                  {e.descripcion}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
