import Link from "next/link";
import { Suspense } from "react";
import { EmpresaForm } from "@/components/empresa-form";
import { DashboardCargando } from "@/components/role-dashboard";
import { verifyRole } from "@/lib/dal";
import { obtenerMiEmpresa } from "@/lib/empresas";

export const metadata = { title: "Perfil de la empresa" };

export default function PerfilEmpresaPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <PerfilEmpresa />
    </Suspense>
  );
}

async function PerfilEmpresa() {
  await verifyRole("empresa");
  const res = await obtenerMiEmpresa();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/empresa" className="text-sm text-accent hover:underline">
          ← Volver al panel
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Perfil de la empresa</h1>
      </div>

      {!res.ok ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar tu perfil: {res.error}</p>
      ) : (
        <>
          {res.data ? (
            res.data.verificada ? (
              <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
                Empresa aprobada: tienes acceso a la plataforma y apareces en el catálogo de los clientes.
              </p>
            ) : (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Pendiente de aprobación: tendrás acceso a la plataforma cuando un administrador te apruebe.
              </p>
            )
          ) : (
            <p className="text-cafe-600 dark:text-cafe-400">
              Completa los datos de tu empresa. Un administrador los revisará para darte acceso a la plataforma.
            </p>
          )}
          <EmpresaForm empresa={res.data} />
        </>
      )}
    </div>
  );
}
