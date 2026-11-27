import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AplicarForm } from "@/components/aplicar-form";
import { DashboardCargando } from "@/components/role-dashboard";
import { Volver } from "@/components/volver";
import { hoyEnChile } from "@/lib/formato";
import { agruparSalidas, listarHorarios, nombrarDias, resumirServicios } from "@/lib/horarios";
import { verificarEmpresaAprobada } from "@/lib/lugares";
import { filtroServicio } from "@/lib/filtro-servicio";

export const metadata = { title: "Aplicar horario" };

type Props = PageProps<"/dashboard/empresa/disponibilidad/horarios/[id]/aplicar">;

export default function AplicarPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <Aplicar params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Aplicar({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  await verificarEmpresaAprobada();
  const { id } = await params;
  const { servicio } = await searchParams;
  const [horarios, servicios] = await Promise.all([listarHorarios(), resumirServicios()]);
  if (!horarios.ok || !servicios.ok) {
    return <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudieron cargar los datos. Inténtalo más tarde.</p>;
  }
  const horario = horarios.data.find((h) => String(h.id) === id);
  if (!horario) notFound();
  const asignados = servicios.data.filter((s) => horario.servicios.some((h) => h.id === s.id));
  const marcado = asignados.find((s) => String(s.id) === servicio)?.id;

  return (
    <div className="flex flex-col gap-4">
      <Volver href={`/dashboard/empresa/disponibilidad/horarios${filtroServicio(servicio).consulta}`}>Volver a horarios</Volver>
      <div>
        <h1 className="text-2xl font-bold">Publicar “{horario.nombre}”</h1>
        <ul className="text-sm text-cafe-600 dark:text-cafe-400">
          {agruparSalidas(horario.salidas).map((g) => (
            <li key={g.dias.join()}>{nombrarDias(g.dias)}: {g.horas.join(" · ")}</li>
          ))}
        </ul>
      </div>
      {asignados.length === 0 ? (
        <p className="text-cafe-500">
          Este horario no tiene servicios. <Link href={`/dashboard/empresa/disponibilidad/horarios/${horario.id}`} className="text-accent hover:underline">Edítalo y márcalos</Link>.
        </p>
      ) : (
        <AplicarForm key={`${horario.id}-${marcado}`} horarioId={horario.id} hoy={hoyEnChile()} servicios={asignados} marcado={marcado} />
      )}
    </div>
  );
}
