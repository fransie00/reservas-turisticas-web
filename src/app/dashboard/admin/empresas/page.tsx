import Link from "next/link";
import { Suspense } from "react";
import { cambiarVerificacion } from "@/app/actions/empresas";
import { DashboardCargando } from "@/components/role-dashboard";
import { verifyRole } from "@/lib/dal";
import { listarTodasLasEmpresas } from "@/lib/empresas";

export const metadata = { title: "Verificación de empresas" };

export default function EmpresasAdminPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <ListadoAdmin />
    </Suspense>
  );
}

async function ListadoAdmin() {
  await verifyRole("admin");
  const res = await listarTodasLasEmpresas();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/admin" className="text-sm text-accent hover:underline">
          ← Volver al panel
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Verificación de empresas</h1>
        <p className="text-cafe-600 dark:text-cafe-400">Solo las empresas verificadas aparecen en el catálogo de los clientes.</p>
      </div>

      {!res.ok ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar el listado: {res.error}</p>
      ) : res.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-cafe-300 p-8 text-center text-cafe-500 dark:border-cafe-700">
          Ninguna empresa ha creado su perfil todavía.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {res.data.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cafe-200 p-4 dark:border-cafe-800">
              <div>
                <p className="font-semibold">
                  {e.nombre_comercial}{" "}
                  <span className="text-sm font-normal text-cafe-500">· {e.categoria} · {e.ciudad}</span>
                </p>
                <p className="text-sm text-cafe-500">
                  RUT {e.rut} · {e.usuario.nombre_completo} ({e.usuario.email})
                  {!e.usuario.activo && " · cuenta desactivada"}
                </p>
              </div>
              <form action={cambiarVerificacion} className="flex items-center gap-3">
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="verificada" value={String(!e.verificada)} />
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${e.verificada ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}>
                  {e.verificada ? "Verificada" : "Pendiente"}
                </span>
                <button type="submit" className="rounded-md border border-cafe-300 px-3 py-1.5 text-sm hover:border-primary dark:border-cafe-700">
                  {e.verificada ? "Quitar verificación" : "Verificar"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
