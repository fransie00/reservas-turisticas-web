import { Suspense } from "react";
import { DashboardCargando } from "@/components/role-dashboard";
import { Volver } from "@/components/volver";
import { verifyRole } from "@/lib/dal";
import { listarEmpresasVerificadas } from "@/lib/empresas";

export const metadata = { title: "Empresas turísticas" };

export default function EmpresasClientePage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <ListadoEmpresas />
    </Suspense>
  );
}

async function ListadoEmpresas() {
  await verifyRole("cliente");
  const res = await listarEmpresasVerificadas();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Volver href="/lugares">Volver al catálogo</Volver>
        <h1 className="mt-2 text-2xl font-bold">Empresas turísticas</h1>
        <p className="text-cafe-600 dark:text-cafe-400">Empresas verificadas disponibles en la plataforma.</p>
      </div>

      {!res.ok ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          No se pudo cargar el listado: {res.error}
        </p>
      ) : res.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-cafe-300 p-8 text-center text-cafe-500 dark:border-cafe-700">
          Aún no hay empresas verificadas. Vuelve pronto.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {res.data.map((e) => (
            <li key={e.id} className="rounded-lg border border-cafe-200 p-4 dark:border-cafe-800">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{e.nombre_comercial}</h2>
                <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-soft-fg">
                  {e.categoria}
                </span>
              </div>
              <p className="mt-1 text-sm text-cafe-500">
                {[e.direccion, e.ciudad].filter(Boolean).join(", ")}
              </p>
              {e.descripcion && (
                <p className="mt-2 text-sm text-cafe-600 dark:text-cafe-400">{e.descripcion}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
