import Link from "next/link";
import { Suspense } from "react";
import { DashboardCargando } from "@/components/role-dashboard";
import { verifyRole } from "@/lib/dal";
import { listarEmpresasVerificadas } from "@/lib/empresas";

export const metadata = { title: "Empresas turísticas · Reservas Turísticas" };

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
        <Link href="/dashboard/cliente" className="text-sm text-blue-600 hover:underline">
          ← Volver al panel
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Empresas turísticas</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Empresas verificadas disponibles en la plataforma.</p>
      </div>

      {!res.ok ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          No se pudo cargar el listado: {res.error}
        </p>
      ) : res.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          Aún no hay empresas verificadas. Vuelve pronto.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {res.data.map((e) => (
            <li key={e.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{e.nombre_comercial}</h2>
                <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {e.categoria}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                {[e.direccion, e.ciudad].filter(Boolean).join(", ")}
              </p>
              {e.descripcion && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{e.descripcion}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
