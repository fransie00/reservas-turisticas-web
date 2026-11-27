import { Suspense } from "react";
import { HorarioForm } from "@/components/horario-form";
import { DashboardCargando } from "@/components/role-dashboard";
import { Volver } from "@/components/volver";
import { agruparSalidas, listarHorarios, resumirServicios } from "@/lib/horarios";
import { verificarEmpresaAprobada } from "@/lib/lugares";
import { filtroServicio } from "@/lib/filtro-servicio";

export const metadata = { title: "Nuevo horario" };

export default function NuevoHorarioPage({ searchParams }: PageProps<"/dashboard/empresa/disponibilidad/horarios/nuevo">) {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <Nuevo searchParams={searchParams} />
    </Suspense>
  );
}

/** Con `?copia=id` parte de las salidas de otro horario; con `?servicio=id`, ese servicio llega marcado. */
async function Nuevo({ searchParams }: { searchParams: Promise<{ copia?: string | string[]; servicio?: string | string[] }> }) {
  await verificarEmpresaAprobada();
  const { copia, servicio } = await searchParams;
  const [res, servicios] = await Promise.all([copia ? listarHorarios() : undefined, resumirServicios()]);
  if (!servicios.ok) return <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudieron cargar tus servicios.</p>;
  const original = res?.ok ? res.data.find((h) => String(h.id) === copia) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <Volver href={`/dashboard/empresa/disponibilidad/horarios${filtroServicio(servicio).consulta}`}>Volver a horarios</Volver>
      <h1 className="text-2xl font-bold">{original ? "Duplicar horario" : "Nuevo horario"}</h1>
      <HorarioForm
        key={`${original?.id ?? "nuevo"}-${servicio}`}
        servicios={servicios.data}
        asignados={servicio ? [Number(servicio)] : []}
        id={null}
        filtro={filtroServicio(servicio).id}
        nombreInicial={original && `${original.nombre} (copia)`.slice(0, 80)}
        grupos={original && agruparSalidas(original.salidas)}
      />
    </div>
  );
}
