import Link from "next/link";
import { Suspense } from "react";
import { BloqueForm, BotonEstadoBloque } from "@/components/bloque-form";
import { DashboardCargando } from "@/components/role-dashboard";
import { listarMisBloques } from "@/lib/disponibilidad";
import { formatoFecha, hoyEnChile } from "@/lib/formato";
import { DIAS, listarMisLugares, verificarEmpresaAprobada } from "@/lib/lugares";
import { listarMisServicios } from "@/lib/servicios";

export const metadata = { title: "Bloques horarios" };

export default function DisponibilidadPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <Disponibilidad />
    </Suspense>
  );
}

const ESTADOS = { disponible: "Disponible", completo: "Completo", cerrado: "Cerrado" };
const error = "text-sm text-red-700 dark:text-red-300";

async function Disponibilidad() {
  await verificarEmpresaAprobada();
  const [bloques, servicios, lugares] = await Promise.all([
    listarMisBloques(),
    listarMisServicios(),
    listarMisLugares(),
  ]);

  const opciones =
    servicios.ok && lugares.ok
      ? servicios.data
          .filter((s) => s.lugar.activo && s.estado !== "cancelado")
          .map((s) => ({
            id: s.id,
            nombre: `${s.nombre} (${s.lugar.nombre})`,
            horario:
              lugares.data
                .find((l) => l.id === s.lugar.id)
                ?.horarios.map((h) => `${DIAS[h.dia - 1]} ${h.apertura}–${h.cierre}`)
                .join(", ") ?? "",
          }))
      : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/empresa" className="text-sm text-accent hover:underline">← Volver al panel</Link>
        <h1 className="mt-2 text-2xl font-bold">Bloques horarios</h1>
        <p className="text-cafe-600 dark:text-cafe-400">Publica las fechas, horarios y cupos que tus clientes pueden reservar.</p>
      </div>

      {!servicios.ok || !lugares.ok ? (
        <p role="alert" className={error}>No se pudieron cargar tus servicios. Inténtalo más tarde.</p>
      ) : opciones.length === 0 ? (
        <p className="text-cafe-500">
          Primero <Link href="/dashboard/empresa/servicios/nuevo" className="text-accent hover:underline">crea un servicio</Link>.
        </p>
      ) : (
        <BloqueForm hoy={hoyEnChile()} servicios={opciones} />
      )}

      <section aria-labelledby="publicados" className="flex flex-col gap-3">
        <h2 id="publicados" className="text-lg font-semibold">Próximos bloques</h2>
        {!bloques.ok ? (
          <p role="alert" className={error}>No se pudo cargar el listado: {bloques.error}</p>
        ) : bloques.data.length === 0 ? (
          <p className="text-sm text-cafe-500">Aún no has publicado bloques.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {bloques.data.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-cafe-200 p-4 dark:border-cafe-800">
                <div className="min-w-48 flex-1">
                  <p className="font-semibold">{formatoFecha(b.fecha)} · {b.hora_inicio} a {b.hora_fin}</p>
                  <p className="text-sm text-cafe-500">{b.servicio.nombre} · {b.lugar.nombre}</p>
                  <p className="text-sm">{ESTADOS[b.estado]} · {b.cupos_disponibles} de {b.cupos_totales} cupos libres</p>
                </div>
                {b.estado !== "completo" && (
                  <BotonEstadoBloque id={b.id} cerrado={b.estado === "cerrado"} nombre={`${b.fecha} ${b.hora_inicio}`} />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
