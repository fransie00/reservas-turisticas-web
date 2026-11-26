import Link from "next/link";
import { Suspense } from "react";
import { DashboardCargando } from "@/components/role-dashboard";
import { verifyRole } from "@/lib/dal";
import { formatoFecha } from "@/lib/formato";
import { listarMisReservas } from "@/lib/reservas";
import type { EstadoReserva } from "@/lib/types";

export const metadata = { title: "Mis reservas" };

/** El estado se distingue por texto, símbolo y color (no depende solo del color). */
const ESTADOS: Record<EstadoReserva, { etiqueta: string; simbolo: string; clases: string }> = {
  pendiente: { etiqueta: "Pendiente", simbolo: "…", clases: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300" },
  aceptada: { etiqueta: "Aceptada", simbolo: "✓", clases: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-300" },
  rechazada: { etiqueta: "Rechazada", simbolo: "✕", clases: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300" },
  cancelada: { etiqueta: "Cancelada", simbolo: "–", clases: "bg-cafe-100 text-cafe-700 dark:bg-cafe-800 dark:text-cafe-300" },
};

export default function MisReservasPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <MisReservas />
    </Suspense>
  );
}

async function MisReservas() {
  await verifyRole("cliente");
  const res = await listarMisReservas();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/cliente" className="text-sm text-accent hover:underline">← Volver al panel</Link>
        <h1 className="mt-2 text-2xl font-bold">Mis reservas</h1>
        <p className="text-cafe-600 dark:text-cafe-400">Historial de tus solicitudes y su estado actual.</p>
      </div>

      {!res.ok ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          No se pudieron cargar tus reservas: {res.error}
        </p>
      ) : res.data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-cafe-300 p-8 text-center text-cafe-500 dark:border-cafe-700">
          <p>Aún no tienes reservas registradas.</p>
          <Link href="/lugares" className="mt-2 inline-block text-sm text-accent hover:underline">
            Explorar lugares turísticos
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {res.data.map((r) => {
            const estado = ESTADOS[r.estado];
            return (
              <li key={r.id} className="rounded-lg border border-cafe-200 p-4 dark:border-cafe-800">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{r.lugar.nombre}</h2>
                    <p className="text-sm text-cafe-500">{r.servicio.nombre} · {r.empresa.nombre_comercial}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${estado.clases}`}>
                    <span aria-hidden="true">{estado.simbolo} </span>
                    <span className="sr-only">Estado: </span>
                    {estado.etiqueta}
                  </span>
                </div>
                <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <div>
                    <dt className="text-cafe-500">Fecha</dt>
                    <dd>{formatoFecha(r.fecha)}</dd>
                  </div>
                  <div>
                    <dt className="text-cafe-500">Hora</dt>
                    <dd>{r.hora_inicio} a {r.hora_fin}</dd>
                  </div>
                  <div>
                    <dt className="text-cafe-500">Personas</dt>
                    <dd>{r.cantidad_personas}</dd>
                  </div>
                </dl>
                {r.estado === "rechazada" && r.motivo_rechazo && (
                  <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-300">
                    <p className="font-semibold">Motivo del rechazo</p>
                    <p className="whitespace-pre-line">{r.motivo_rechazo}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
