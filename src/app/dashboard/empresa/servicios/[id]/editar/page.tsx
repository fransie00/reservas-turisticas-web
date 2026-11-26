import { Suspense } from "react";
import { DashboardCargando } from "@/components/role-dashboard";
import { ServicioForm } from "@/components/servicio-form";
import { listarMisLugares, verificarEmpresaAprobada } from "@/lib/lugares";
import { obtenerMiServicio } from "@/lib/servicios";

export const metadata = { title: "Editar servicio" };

export default function EditarServicioPage({ params }: PageProps<"/dashboard/empresa/servicios/[id]/editar">) {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <EditarServicio params={params} />
    </Suspense>
  );
}

async function EditarServicio({ params }: { params: Promise<{ id: string }> }) {
  await verificarEmpresaAprobada();
  const [servicio, lugares] = await Promise.all([
    obtenerMiServicio((await params).id),
    listarMisLugares(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Editar servicio</h1>
      {!servicio.ok ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar el servicio: {servicio.error}</p>
      ) : !lugares.ok ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudieron cargar tus lugares: {lugares.error}</p>
      ) : (
        // key: al cambiar de servicio, el formulario parte de cero
        <ServicioForm key={servicio.data.id} servicio={servicio.data} lugares={lugares.data.map(({ id, nombre }) => ({ id, nombre }))} />
      )}
    </div>
  );
}
