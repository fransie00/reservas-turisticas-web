import { Suspense } from "react";
import { AccionesSolicitud } from "@/components/acciones-solicitud";
import { EstadoReservaBadge } from "@/components/estado-reserva";
import { ListaAcompanantes } from "@/components/lista-acompanantes";
import { DashboardCargando } from "@/components/role-dashboard";
import { Volver } from "@/components/volver";
import { formatoFecha } from "@/lib/formato";
import { verificarEmpresaAprobada } from "@/lib/lugares";
import { listarSolicitudes } from "@/lib/solicitudes";
import type { Solicitud } from "@/lib/types";

export const metadata = { title: "Solicitudes" };

export default function SolicitudesPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <Solicitudes />
    </Suspense>
  );
}

async function Solicitudes() {
  await verificarEmpresaAprobada();
  const res = await listarSolicitudes();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Volver href="/dashboard/empresa">Volver al panel</Volver>
        <h1 className="mt-2 text-2xl font-bold">Solicitudes</h1>
        <p className="text-cafe-600 dark:text-cafe-400">Reservas que han hecho tus clientes. Las pendientes aparecen primero.</p>
      </div>

      {!res.ok ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          No se pudieron cargar las solicitudes: {res.error}
        </p>
      ) : res.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-cafe-300 p-8 text-center text-cafe-500 dark:border-cafe-700">
          Aún no has recibido solicitudes de reserva.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {res.data.map((s) => (
            <Tarjeta key={s.id} solicitud={s} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Tarjeta({ solicitud: s }: { solicitud: Solicitud }) {
  const datos = [
    ["Fecha", formatoFecha(s.fecha)],
    ["Hora", `${s.hora_inicio} a ${s.hora_fin}`],
    ["Personas", s.cantidad_personas],
  ] as const;
  const motivo =
    s.estado === "rechazada" ? s.motivo_rechazo : s.estado === "cancelada" ? s.motivo_cancelacion : null;

  return (
    <li className="rounded-xl border border-cafe-200 p-4 dark:border-cafe-800">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold">{s.cliente.nombre_completo}</h2>
          <p className="text-sm text-cafe-500">
            RUT {s.cliente.rut} · <a href={`mailto:${s.cliente.email}`} className="underline">{s.cliente.email}</a>
            {s.cliente.telefono && <> · <a href={`tel:${s.cliente.telefono}`} className="underline">{s.cliente.telefono}</a></>}
          </p>
        </div>
        <EstadoReservaBadge estado={s.estado} />
      </div>
      <p className="mt-3 text-sm font-medium">{s.lugar.nombre} · {s.servicio.nombre}</p>
      <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        {datos.map(([etiqueta, valor]) => (
          <div key={etiqueta}>
            <dt className="text-cafe-500">{etiqueta}</dt>
            <dd>{valor}</dd>
          </div>
        ))}
      </dl>
      <ListaAcompanantes acompanantes={s.acompanantes} />
      {s.notas && (
        <p className="mt-3 whitespace-pre-line text-sm"><span className="text-cafe-500">Notas del cliente: </span>{s.notas}</p>
      )}
      {motivo && (
        <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-300">
          <p className="font-semibold">{s.estado === "rechazada" ? "Motivo del rechazo" : "Motivo de la cancelación"}</p>
          <p className="whitespace-pre-line">{motivo}</p>
        </div>
      )}
      {s.estado === "pendiente" && (
        <AccionesSolicitud
          id={s.id}
          resumen={`${s.cliente.nombre_completo}, ${s.servicio.nombre}, ${formatoFecha(s.fecha)} a las ${s.hora_inicio}`}
        />
      )}
    </li>
  );
}
