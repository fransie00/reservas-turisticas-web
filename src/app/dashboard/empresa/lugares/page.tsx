import Link from "next/link";
import { Suspense } from "react";
import { EliminarLugar } from "@/components/eliminar-lugar";
import { DashboardCargando } from "@/components/role-dashboard";
import { listarMisLugares, verificarEmpresaAprobada } from "@/lib/lugares";

export const metadata = { title: "Lugares turísticos" };

export default function MisLugaresPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <MisLugares />
    </Suspense>
  );
}

async function MisLugares() {
  await verificarEmpresaAprobada();
  const res = await listarMisLugares();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/empresa" className="text-sm text-accent hover:underline">← Volver al panel</Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Lugares turísticos</h1>
          <Link href="/dashboard/empresa/lugares/nuevo" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
            Crear lugar
          </Link>
        </div>
      </div>

      {!res.ok ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar el listado: {res.error}</p>
      ) : res.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-cafe-300 p-8 text-center text-cafe-500 dark:border-cafe-700">
          Aún no tienes lugares turísticos. Crea el primero.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {res.data.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-cafe-200 p-4 dark:border-cafe-800">
              {l.imagenes[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.imagenes[0].url} alt="" className="h-20 w-28 rounded-md object-cover" />
              )}
              <div className="min-w-48 flex-1">
                <p className="font-semibold">{l.nombre}</p>
                <p className="text-sm text-cafe-500">{l.direccion}, {l.ciudad} · {l.capacidad} cupos</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/empresa/lugares/${l.id}/editar`} className="rounded-md border border-cafe-300 px-3 py-1.5 text-sm hover:border-primary dark:border-cafe-700">
                  Editar
                </Link>
                <EliminarLugar id={l.id} nombre={l.nombre} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
