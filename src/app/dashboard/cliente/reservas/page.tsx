import Link from "next/link";
import { Suspense } from "react";
import { EstadoReservaBadge } from "@/components/estado-reserva";
import { ListaAcompanantes } from "@/components/lista-acompanantes";
import { DashboardCargando } from "@/components/role-dashboard";
import { Volver } from "@/components/volver";
import { verifyRole } from "@/lib/dal";
import { formatoFecha } from "@/lib/formato";
import { listarMisReservas } from "@/lib/reservas";

export const metadata = { title: "Mis reservas" };

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
        <Volver href="/lugares">Volver al catálogo</Volver>
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
          {res.data.map((r) => (
            <li key={r.id} className="rounded-xl border border-cafe-200 p-4 dark:border-cafe-800">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{r.lugar.nombre}</h2>
                  <p className="text-sm text-cafe-500">{r.servicio.nombre} · {r.empresa.nombre_comercial}</p>
                </div>
                <EstadoReservaBadge estado={r.estado} />
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
              <ListaAcompanantes acompanantes={r.acompanantes} />
              {r.estado === "cancelada" && r.motivo_cancelacion && (
                <div className="mt-3 rounded-md border-2 border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                  <p className="font-semibold">{r.empresa.nombre_comercial} canceló esta reserva</p>
                  <p className="whitespace-pre-line">{r.motivo_cancelacion}</p>
                  {r.empresa.contacto && (
                    <p className="mt-2">
                      Contacta a la empresa:{" "}
                      <a href={`mailto:${r.empresa.contacto.email}`} className="font-semibold underline">{r.empresa.contacto.email}</a>
                      {r.empresa.contacto.telefono && <> · <a href={`tel:${r.empresa.contacto.telefono}`} className="font-semibold underline">{r.empresa.contacto.telefono}</a></>}
                    </p>
                  )}
                </div>
              )}
              {r.estado === "rechazada" && r.motivo_rechazo && (
                <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-300">
                  <p className="font-semibold">Motivo del rechazo</p>
                  <p className="whitespace-pre-line">{r.motivo_rechazo}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
