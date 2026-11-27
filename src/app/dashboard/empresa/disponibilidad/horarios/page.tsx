import Link from "next/link";
import { Suspense } from "react";
import { EncabezadoDisponibilidad } from "@/components/encabezado-disponibilidad";
import { boton, tarjeta } from "@/components/estilos";
import { DashboardCargando } from "@/components/role-dashboard";
import { formatoFecha } from "@/lib/formato";
import { agruparSalidas, listarHorarios, nombrarDias, resumirServicios } from "@/lib/horarios";
import { verificarEmpresaAprobada } from "@/lib/lugares";

export const metadata = { title: "Horarios" };

const BASE = "/dashboard/empresa/disponibilidad/horarios";

export default function HorariosPage({ searchParams }: PageProps<"/dashboard/empresa/disponibilidad/horarios">) {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <Horarios searchParams={searchParams} />
    </Suspense>
  );
}

async function Horarios({ searchParams }: { searchParams: Promise<{ servicio?: string | string[] }> }) {
  await verificarEmpresaAprobada();
  const { servicio } = await searchParams;
  const filtro = typeof servicio === "string" && /^\d+$/.test(servicio) ? Number(servicio) : undefined;
  const consulta = filtro ? `?servicio=${filtro}` : "";
  const [res, resumen] = await Promise.all([listarHorarios(), filtro ? resumirServicios() : undefined]);
  const elegido = resumen?.ok ? resumen.data.find((s) => s.id === filtro) : undefined;
  // Con un servicio elegido solo se muestran sus horarios.
  const horarios = res.ok ? res.data.filter((h) => !filtro || h.servicios.some((s) => s.id === filtro)) : [];

  return (
    <div className="flex flex-col gap-4">
      <EncabezadoDisponibilidad activa="horarios" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-cafe-600 dark:text-cafe-400">
          {filtro ? (
            <>
              Horarios de <strong>{elegido?.nombre ?? "este servicio"}</strong>.
            </>
          ) : (
            "Cada horario guarda días y horas de salida para los servicios que le asignes."
          )}
        </p>
        <Link href={`${BASE}/nuevo${consulta}`} className={boton}>Nuevo horario</Link>
      </div>

      {!res.ok ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudieron cargar los horarios: {res.error}</p>
      ) : horarios.length === 0 ? (
        <p className="rounded-lg border border-dashed border-cafe-300 p-8 text-center text-cafe-500 dark:border-cafe-700">
          {filtro ? "Este servicio aún no tiene horarios. Crea uno, o edita un horario existente y márcale este servicio." : "Aún no tienes horarios. Crea el primero."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {horarios.map((h) => (
            <li key={h.id} className={tarjeta}>
              <h2 className="font-semibold">{h.nombre}</h2>
              <p className="text-sm text-cafe-500">
                {h.servicios.length ? `Para: ${h.servicios.map((s) => s.nombre).join(", ")}` : "⚠ Sin servicios asignados: edítalo para usarlo."}
              </p>
              <ul className="mt-1 text-sm">
                {agruparSalidas(h.salidas).map((g) => (
                  <li key={g.dias.join()}><span className="font-medium">{nombrarDias(g.dias)}:</span> {g.horas.join(" · ")}</li>
                ))}
              </ul>
              <div className="mt-3 text-sm">
                <p className="text-cafe-500">{h.aplicaciones.some((a) => !filtro || a.servicio.id === filtro) ? "Publicado en:" : "Sin aplicaciones vigentes."}</p>
                <ul>
                  {h.aplicaciones.filter((a) => !filtro || a.servicio.id === filtro).map((a, i) => (
                    <li key={i}>{a.servicio.nombre} · {a.cupos} cupos · {formatoFecha(a.desde)} a {formatoFecha(a.hasta)}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                {h.servicios.length > 0 && (
                  <Link href={`${BASE}/${h.id}/aplicar${consulta}`} className="font-semibold text-accent hover:underline">Publicar fechas</Link>
                )}
                <Link href={`${BASE}/${h.id}${consulta}`} className="hover:underline">Editar</Link>
                <Link href={`${BASE}/nuevo?copia=${h.id}${filtro ? `&servicio=${filtro}` : ""}`} className="hover:underline">Duplicar</Link>
                <Link href={`${BASE}/${h.id}/eliminar${consulta}`} className="text-red-700 hover:underline dark:text-red-300">Eliminar</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
