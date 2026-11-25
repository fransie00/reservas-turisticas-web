import Link from "next/link";
import { verifyRole } from "@/lib/dal";
import { ETIQUETA_ROL } from "@/lib/roles";
import type { RolNombre } from "@/lib/types";

export interface Seccion {
  titulo: string;
  descripcion: string;
  /** Si no se indica, la sección aparece como "Próximamente". */
  href?: string;
}

/** Dashboard genérico: valida el rol en el servidor y pinta las secciones del rol. */
export async function RoleDashboard({
  rol,
  descripcion,
  secciones,
}: {
  rol: RolNombre;
  descripcion: string;
  secciones: Seccion[];
}) {
  const user = await verifyRole(rol);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {ETIQUETA_ROL[user.rol]}
        </span>
        <h1 className="mt-2 text-2xl font-bold">Hola, {user.nombre_completo}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{descripcion}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {secciones.map((s) => {
          const contenido = (
            <>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold">{s.titulo}</h2>
                {!s.href && (
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
                    Próximamente
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{s.descripcion}</p>
            </>
          );
          const base = "rounded-lg border border-zinc-200 p-4 dark:border-zinc-800";
          return s.href ? (
            <Link key={s.titulo} href={s.href} className={`${base} transition-colors hover:border-blue-600`}>
              {contenido}
            </Link>
          ) : (
            <div key={s.titulo} className={`${base} opacity-80`}>{contenido}</div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardCargando() {
  return <p className="text-zinc-500">Cargando…</p>;
}
