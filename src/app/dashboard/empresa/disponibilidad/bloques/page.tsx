import Link from "next/link";
import { Suspense } from "react";
import { BotonEstadoBloque } from "@/components/boton-estado-bloque";
import { EncabezadoDisponibilidad } from "@/components/encabezado-disponibilidad";
import { DashboardCargando } from "@/components/role-dashboard";
import { listarMisBloques } from "@/lib/disponibilidad";
import { formatoFecha, formatoMes, hoyEnChile, sumarMeses } from "@/lib/formato";
import { verificarEmpresaAprobada } from "@/lib/lugares";
import type { Bloque } from "@/lib/types";

export const metadata = { title: "Bloques publicados" };

type Props = PageProps<"/dashboard/empresa/disponibilidad/bloques">;

export default function BloquesPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <Bloques searchParams={searchParams} />
    </Suspense>
  );
}

const ESTADOS = { disponible: "Disponible", completo: "Completo", cerrado: "Cerrado" };

async function Bloques({ searchParams }: Pick<Props, "searchParams">) {
  await verificarEmpresaAprobada();
  const actual = hoyEnChile().slice(0, 7);
  const pedido = (await searchParams).mes;
  const mes = typeof pedido === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(pedido) && pedido > actual ? pedido : actual;
  const listado = await listarMisBloques(mes);

  const porDia = new Map<string, Bloque[]>();
  if (listado.ok) {
    for (const b of listado.data.bloques) porDia.set(b.fecha, [...(porDia.get(b.fecha) ?? []), b]);
  }
  const enlace = (m: string) => `/dashboard/empresa/disponibilidad/bloques?mes=${m}`;

  return (
    <div className="flex flex-col gap-3">
      <EncabezadoDisponibilidad activa="bloques" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold first-letter:uppercase">{formatoMes(mes)}</h2>
        <nav aria-label="Mes" className="flex gap-4 text-sm">
          {mes > actual && <Link href={enlace(sumarMeses(mes, -1))} className="text-accent hover:underline">← Mes anterior</Link>}
          <Link href={enlace(sumarMeses(mes, 1))} className="text-accent hover:underline">Mes siguiente →</Link>
        </nav>
      </div>
      {!listado.ok ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar el listado: {listado.error}</p>
      ) : porDia.size === 0 ? (
        <p className="text-sm text-cafe-500">No hay bloques publicados en este mes.</p>
      ) : (
        [...porDia].map(([fecha, bloques]) => (
          <details key={fecha} className="rounded-lg border border-cafe-200 p-3 dark:border-cafe-800">
            <summary className="cursor-pointer text-sm">
              <span className="font-semibold">{formatoFecha(fecha)}</span>
              <span className="text-cafe-500"> · {bloques.length} {bloques.length === 1 ? "bloque" : "bloques"}</span>
            </summary>
            <ul className="mt-3 flex flex-col gap-2">
              {bloques.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-4 border-t border-cafe-200 pt-2 dark:border-cafe-800">
                  <div className="min-w-48 flex-1 text-sm">
                    <p className="font-semibold">{b.hora_inicio} a {b.hora_fin} · {b.servicio.nombre}</p>
                    <p className="text-cafe-500">{b.lugar.nombre} · {ESTADOS[b.estado]} · {b.cupos_disponibles} de {b.cupos_totales} cupos libres</p>
                  </div>
                  {b.estado !== "completo" && (
                    <BotonEstadoBloque id={b.id} cerrado={b.estado === "cerrado"} nombre={`${b.fecha} ${b.hora_inicio}`} />
                  )}
                </li>
              ))}
            </ul>
          </details>
        ))
      )}
    </div>
  );
}
