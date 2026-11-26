import Link from "next/link";
import { Suspense } from "react";
import { EstadoServicioSelect } from "@/components/estado-servicio";
import { DashboardCargando } from "@/components/role-dashboard";
import { formatoDuracion, formatoPrecio } from "@/lib/formato";
import { verificarEmpresaAprobada } from "@/lib/lugares";
import { listarMisServicios } from "@/lib/servicios";

export const metadata = { title: "Servicios" };

export default function MisServiciosPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <MisServicios />
    </Suspense>
  );
}

async function MisServicios() {
  await verificarEmpresaAprobada();
  const res = await listarMisServicios();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/empresa" className="text-sm text-accent hover:underline">← Volver al panel</Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Servicios</h1>
          <Link href="/dashboard/empresa/servicios/nuevo" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
            Crear servicio
          </Link>
        </div>
      </div>

      {!res.ok ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar el listado: {res.error}</p>
      ) : res.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-cafe-300 p-8 text-center text-cafe-500 dark:border-cafe-700">
          Aún no tienes servicios. Crea el primero.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {res.data.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-cafe-200 p-4 dark:border-cafe-800">
              <div className="min-w-48 flex-1">
                <p className="font-semibold">{s.nombre}</p>
                <p className="text-sm text-cafe-500">{s.lugar.nombre} · {formatoDuracion(s.duracion_minutos)} · {formatoPrecio(s.precio)}</p>
                {!s.lugar.activo && (
                  <p className="text-sm text-red-700 dark:text-red-300">El lugar fue eliminado: edita el servicio para asignarle otro.</p>
                )}
              </div>
              <div className="flex flex-wrap items-start gap-2">
                <EstadoServicioSelect id={s.id} nombre={s.nombre} estado={s.estado} />
                <Link href={`/dashboard/empresa/servicios/${s.id}/editar`} className="rounded-md border border-cafe-300 px-3 py-1.5 text-sm hover:border-primary dark:border-cafe-700">
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
