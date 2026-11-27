import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EliminarHorarioForm } from "@/components/eliminar-horario-form";
import { tarjeta } from "@/components/estilos";
import { DashboardCargando } from "@/components/role-dashboard";
import { Volver } from "@/components/volver";
import { filtroServicio } from "@/lib/filtro-servicio";
import { formatoFecha } from "@/lib/formato";
import { listarHorarios, verImpacto } from "@/lib/horarios";
import { verificarEmpresaAprobada } from "@/lib/lugares";

export const metadata = { title: "Eliminar horario" };

type Props = PageProps<"/dashboard/empresa/disponibilidad/horarios/[id]/eliminar">;

export default function EliminarPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <Eliminar params={params} searchParams={searchParams} />
    </Suspense>
  );
}

const error = "text-sm text-red-700 dark:text-red-300";

async function Eliminar({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  await verificarEmpresaAprobada();
  const { id } = await params;
  const filtro = filtroServicio((await searchParams).servicio);
  const volver = `/dashboard/empresa/disponibilidad/horarios${filtro.consulta}`;

  const horarios = await listarHorarios();
  if (!horarios.ok) return <p role="alert" className={error}>No se pudo cargar: {horarios.error}</p>;
  const horario = horarios.data.find((h) => String(h.id) === id);
  if (!horario) notFound();
  const res = await verImpacto(horario.id);
  if (!res.ok) return <p role="alert" className={error}>No se pudo calcular el impacto: {res.error}</p>;
  const i = res.data;

  return (
    <div className="flex flex-col gap-4">
      <Volver href={volver}>Volver a horarios</Volver>
      <h1 className="text-2xl font-bold">Eliminar “{i.nombre}”</h1>
      <ul className={`${tarjeta} list-inside list-disc text-sm`}>
        <li>Salidas futuras sin reservas que se eliminan: {i.salidas_a_eliminar}</li>
        <li>Salidas con reservas que se retiran (nadie más podrá reservarlas): {i.salidas_a_anular}</li>
        <li><strong>Reservas pendientes o aceptadas que quedan canceladas: {i.reservas.length}</strong></li>
        <li>Las salidas pasadas no se tocan. Esto no se puede deshacer.</li>
      </ul>

      {i.reservas.length > 0 && (
        <section aria-labelledby="afectados" className="flex flex-col gap-2">
          <h2 id="afectados" className="font-semibold">Clientes afectados</h2>
          <p className="text-sm text-cafe-500">No se les avisa automáticamente: escríbeles.</p>
          <ul className="flex flex-col gap-2">
            {i.reservas.map((r) => (
              <li key={r.id} className={`${tarjeta} text-sm`}>
                <p className="font-semibold">{r.cliente.nombre_completo} · {r.cantidad_personas} {r.cantidad_personas === 1 ? "persona" : "personas"}</p>
                <p>{r.servicio} · {formatoFecha(r.fecha)} · {r.hora_inicio} · {r.estado}</p>
                <p className="text-cafe-500">
                  <a href={`mailto:${r.cliente.email}`} className="text-accent hover:underline">{r.cliente.email}</a>
                  {r.cliente.telefono && <> · <a href={`tel:${r.cliente.telefono}`} className="text-accent hover:underline">{r.cliente.telefono}</a></>}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <EliminarHorarioForm key={horario.id} id={horario.id} filtro={filtro.id} afectadas={i.reservas.length} volver={volver} />
    </div>
  );
}
