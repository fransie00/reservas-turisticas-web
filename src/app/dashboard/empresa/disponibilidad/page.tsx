import Link from "next/link";
import { Suspense } from "react";
import { EncabezadoDisponibilidad } from "@/components/encabezado-disponibilidad";
import { tarjeta } from "@/components/estilos";
import { DashboardCargando } from "@/components/role-dashboard";
import { formatoDuracion, formatoFecha, hoyEnChile } from "@/lib/formato";
import { resumirServicios } from "@/lib/horarios";
import { verificarEmpresaAprobada } from "@/lib/lugares";
import type { ResumenServicio } from "@/lib/types";

export const metadata = { title: "Disponibilidad" };

const DIAS_AVISO = 14;

export default function ResumenPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <Resumen />
    </Suspense>
  );
}

/** Texto y símbolo, para no depender solo del color. */
function estado(s: ResumenServicio, hoy: string) {
  if (!s.hasta) return { texto: "⚠ Sin horarios", clases: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300" };
  const quedan = Math.round((Date.parse(s.hasta) - Date.parse(hoy)) / 86_400_000);
  return quedan <= DIAS_AVISO
    ? { texto: quedan === 0 ? "⚠ Vence hoy" : `⚠ Vence en ${quedan} ${quedan === 1 ? "día" : "días"}`, clases: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300" }
    : { texto: "✓ Al día", clases: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-300" };
}

async function Resumen() {
  await verificarEmpresaAprobada();
  const res = await resumirServicios();
  const hoy = hoyEnChile();

  return (
    <div className="flex flex-col gap-4">
      <EncabezadoDisponibilidad activa="resumen" />
      {!res.ok ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar el resumen: {res.error}</p>
      ) : res.data.length === 0 ? (
        <p className="text-cafe-500">
          Primero <Link href="/dashboard/empresa/servicios/nuevo" className="text-accent hover:underline">crea un servicio</Link>.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {res.data.map((s) => {
            const e = estado(s, hoy);
            return (
              <li key={s.id} className={tarjeta}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{s.nombre}</h2>
                    <p className="text-sm text-cafe-500">{s.lugar.nombre} · {formatoDuracion(s.duracion_minutos)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${e.clases}`}>{e.texto}</span>
                </div>
                <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <div><dt className="text-cafe-500">Horario</dt><dd>{s.horarios.map((h) => h.nombre).join(", ") || (s.proximos ? "Bloques sueltos" : "—")}</dd></div>
                  <div><dt className="text-cafe-500">Cupos</dt><dd>{s.cupos ?? "—"}</dd></div>
                  <div><dt className="text-cafe-500">Vigente hasta</dt><dd>{s.hasta ? formatoFecha(s.hasta) : "—"}</dd></div>
                  <div><dt className="text-cafe-500">Salidas próximas</dt><dd>{s.proximos}</dd></div>
                </dl>
                <Link href={`/dashboard/empresa/disponibilidad/horarios?servicio=${s.id}`} className="mt-3 inline-block text-sm text-accent hover:underline">
                  Ver sus horarios
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
