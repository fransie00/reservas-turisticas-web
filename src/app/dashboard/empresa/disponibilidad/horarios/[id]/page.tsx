import { Suspense } from "react";
import { notFound } from "next/navigation";
import { HorarioForm } from "@/components/horario-form";
import { DashboardCargando } from "@/components/role-dashboard";
import { Volver } from "@/components/volver";
import { agruparSalidas, listarHorarios, resumirServicios } from "@/lib/horarios";
import { verificarEmpresaAprobada } from "@/lib/lugares";
import { filtroServicio } from "@/lib/filtro-servicio";

export const metadata = { title: "Editar horario" };

export default function EditarHorarioPage({ params, searchParams }: PageProps<"/dashboard/empresa/disponibilidad/horarios/[id]">) {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <Editar params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Editar({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ servicio?: string | string[] }> }) {
  await verificarEmpresaAprobada();
  const { id } = await params;
  const { servicio } = await searchParams;
  const [res, servicios] = await Promise.all([listarHorarios(), resumirServicios()]);
  if (!res.ok || !servicios.ok) return <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar el horario.</p>;
  const horario = res.data.find((h) => String(h.id) === id);
  if (!horario) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Volver href={`/dashboard/empresa/disponibilidad/horarios${filtroServicio(servicio).consulta}`}>Volver a horarios</Volver>
      <h1 className="text-2xl font-bold">Editar horario</h1>
      <p role="note" className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent-soft-fg">
        Los cambios no modifican los bloques que ya publicaste. Se usan la próxima vez que apliques este horario.
      </p>
      <HorarioForm key={`${horario.id}-${servicio}`} filtro={filtroServicio(servicio).id} id={horario.id} servicios={servicios.data} asignados={horario.servicios.map((s) => s.id)} nombreInicial={horario.nombre} grupos={agruparSalidas(horario.salidas)} />
    </div>
  );
}
