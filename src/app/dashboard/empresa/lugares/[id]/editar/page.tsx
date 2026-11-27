import { Suspense } from "react";
import { LugarForm } from "@/components/lugar-form";
import { DashboardCargando } from "@/components/role-dashboard";
import { obtenerMiLugar, verificarEmpresaAprobada } from "@/lib/lugares";

export const metadata = { title: "Editar lugar turístico" };

export default function EditarLugarPage({ params }: PageProps<"/dashboard/empresa/lugares/[id]/editar">) {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <EditarLugar params={params} />
    </Suspense>
  );
}

async function EditarLugar({ params }: { params: Promise<{ id: string }> }) {
  await verificarEmpresaAprobada();
  const res = await obtenerMiLugar((await params).id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Editar lugar turístico</h1>
      {res.ok ? (
        // key: al cambiar de lugar, el formulario parte de cero
        <LugarForm key={res.data.id} lugar={res.data} />
      ) : (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar el lugar: {res.error}</p>
      )}
    </div>
  );
}
