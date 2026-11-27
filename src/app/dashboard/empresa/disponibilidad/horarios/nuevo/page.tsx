import { Suspense } from "react";
import { HorarioForm } from "@/components/horario-form";
import { DashboardCargando } from "@/components/role-dashboard";
import { Volver } from "@/components/volver";
import { agruparSalidas, listarHorarios, listarSueltas, resumirServicios } from "@/lib/horarios";
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

/**
 * Con `?copia=id` parte de las salidas de otro horario; con `?sueltas=id`, de las publicadas sin
 * horario de ese servicio. Con `?servicio=id`, ese servicio llega marcado.
 */
async function Nuevo({ searchParams }: { searchParams: Promise<{ copia?: string | string[]; sueltas?: string | string[]; servicio?: string | string[] }> }) {
  await verificarEmpresaAprobada();
  const { copia, sueltas, servicio } = await searchParams;
  const [res, resSueltas, servicios] = await Promise.all([copia ? listarHorarios() : undefined, sueltas ? listarSueltas() : undefined, resumirServicios()]);
  if (!servicios.ok) return <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudieron cargar tus servicios.</p>;
  const original = res?.ok ? res.data.find((h) => String(h.id) === copia) : undefined;
  const suelta = resSueltas?.ok ? resSueltas.data.find((g) => String(g.servicio.id) === sueltas) : undefined;
  const salidas = original?.salidas ?? suelta?.salidas;

  return (
    <div className="flex flex-col gap-4">
      <Volver href={`/dashboard/empresa/disponibilidad/horarios${filtroServicio(servicio).consulta}`}>Volver a horarios</Volver>
      <h1 className="text-2xl font-bold">{original ? "Duplicar horario" : "Nuevo horario"}</h1>
      <HorarioForm
        key={`${original?.id ?? "nuevo"}-${suelta?.servicio.id}-${servicio}`}
        servicios={servicios.data}
        asignados={suelta ? [suelta.servicio.id] : servicio ? [Number(servicio)] : []}
        id={null}
        filtro={filtroServicio(servicio).id}
        nombreInicial={original ? `${original.nombre} (copia)`.slice(0, 80) : suelta?.servicio.nombre.slice(0, 80)}
        grupos={salidas && agruparSalidas(salidas)}
      />
    </div>
  );
}
