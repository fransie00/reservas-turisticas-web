"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, useTransition } from "react";
import { cargarMes, crearReserva, type Disponibilidad, type ReservaState } from "@/app/actions/reservas";
import { formatoDuracion, formatoFecha, formatoPrecio } from "@/lib/formato";
import type { Reserva, ServicioPublico } from "@/lib/types";
import { Calendario } from "./calendario";
import { Field, FormErrors } from "./form-ui";

const control =
  "rounded-md border border-cafe-300 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-cafe-700";

export function ReservaForm({
  lugarId,
  hoy,
  direccion,
  servicios,
  disponibilidad,
  onCerrar,
}: {
  lugarId: number;
  hoy: string;
  direccion: string;
  /** Solo los reservables. */
  servicios: ServicioPublico[];
  /** El primer mes con bloques. */
  disponibilidad: Disponibilidad;
  /** Cierra la ventana de reserva. Sin él (página propia) se ofrece volver al lugar. */
  onCerrar?: () => void;
}) {
  const [vista, setVista] = useState(disponibilidad);
  const [cargandoMes, iniciarCarga] = useTransition();
  const [errorMes, setErrorMes] = useState(false);
  const [state, action, pending] = useActionState(async (previo: ReservaState | undefined, datos: FormData) => {
    const resultado = await crearReserva(lugarId, previo, datos);
    if (resultado.disponibilidad) setVista(resultado.disponibilidad);
    return resultado;
  }, undefined);
  const [servicioId, setServicioId] = useState(servicios.length === 1 ? servicios[0].id : 0);
  const [fecha, setFecha] = useState<string>();
  const [bloqueId, setBloqueId] = useState<number>();
  const [personas, setPersonas] = useState("1");

  const delServicio = vista.bloques.filter((b) => b.servicio_id === servicioId);
  // Si ni el primer mes disponible trae bloques, no hay nada publicado.
  const sinHorarios = disponibilidad.bloques.length === 0;

  function verMes(mes: string) {
    setFecha(undefined);
    setBloqueId(undefined);
    setErrorMes(false);
    iniciarCarga(async () => {
      const nueva = await cargarMes(lugarId, mes).catch(() => null);
      if (nueva) setVista(nueva);
      else setErrorMes(true);
    });
  }

  const delDia = delServicio.filter((b) => b.fecha === fecha);
  // Se deriva de la disponibilidad actual: si el horario se agota, deja de estar elegido.
  const elegido = delDia.find((b) => b.id === bloqueId);
  const cantidad = Number(personas);
  const cantidadValida = Number.isInteger(cantidad) && cantidad >= 1;
  const alcanzan = !elegido || cantidad <= elegido.cupos_disponibles;
  const valido = elegido !== undefined && cantidadValida && alcanzan;

  const aviso = !servicioId
    ? "Elige un servicio."
    : !fecha
      ? "Elige una fecha."
      : !elegido
        ? "Elige un horario disponible."
        : !cantidadValida
          ? "Indica cuántas personas asistirán."
          : !alcanzan
            ? `Ese horario solo tiene ${elegido.cupos_disponibles} cupos.`
            : undefined;

  /** Se envía a mano para que React no vacíe el formulario cuando la API responde con errores. */
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valido || pending) return;
    const datos = new FormData(e.currentTarget);
    startTransition(() => action(datos));
  }

  if (state?.reserva) {
    return <Confirmacion reserva={state.reserva} direccion={direccion} lugarId={lugarId} onCerrar={onCerrar} />;
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      {servicios.length === 1 ? (
        <p className="text-sm">
          <strong>{servicios[0].nombre}</strong>
          <span className="text-cafe-500"> · {formatoDuracion(servicios[0].duracion_minutos)} · {formatoPrecio(servicios[0].precio)}</span>
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <label htmlFor="servicio" className="text-sm font-medium">Servicio</label>
          <select
            id="servicio"
            value={servicioId || ""}
            onChange={(e) => {
              setServicioId(Number(e.target.value));
              setBloqueId(undefined);
            }}
            className={control}
          >
            <option value="" disabled>Selecciona un servicio</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} · {formatoDuracion(s.duracion_minutos)} · {formatoPrecio(s.precio)}
              </option>
            ))}
          </select>
        </div>
      )}

      {sinHorarios ? (
        <>
          <p role="status" className="text-sm text-cafe-500">
            La empresa aún no tiene horarios publicados.
          </p>
          <FormErrors errors={state?.errors} />
        </>
      ) : (
        <>
          <fieldset disabled={!servicioId} className="flex flex-col gap-2 disabled:opacity-60">
            <legend className="mb-2 text-sm font-medium">Fecha</legend>
            <input type="hidden" name="mes" value={vista.mes} />
            <Calendario
              hoy={hoy}
              mes={vista.mes}
              cargando={cargandoMes}
              onMes={verMes}
              conCupos={new Set(delServicio.map((b) => b.fecha))}
              valor={fecha}
              onElegir={(f) => {
                setFecha(f);
                setBloqueId(undefined);
              }}
            />
            {errorMes && <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar ese mes.</p>}
          </fieldset>

          {servicioId > 0 && fecha && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Horarios del {formatoFecha(fecha)}</legend>
              {delDia.length === 0 ? (
                <p role="status" className="text-sm text-cafe-500">No hay horarios disponibles para esta fecha. Prueba con otra.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {delDia.map((b) => (
                    <label key={b.id} className="flex cursor-pointer flex-col items-center rounded-lg border border-cafe-300 p-2 text-sm has-checked:border-primary has-checked:bg-primary has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-primary has-focus-visible:ring-offset-2 dark:border-cafe-700">
                      <input type="radio" name="bloque_id" value={b.id} checked={elegido?.id === b.id} onChange={() => setBloqueId(b.id)} className="sr-only" />
                      {b.hora_inicio} a {b.hora_fin}
                      <span className="text-xs opacity-80">{b.cupos_disponibles} {b.cupos_disponibles === 1 ? "cupo" : "cupos"}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
          )}

          <div className="max-w-40">
            <Field id="cantidad_personas" label="Personas" type="number" min={1} max={elegido?.cupos_disponibles} step={1} value={personas} onChange={(e) => setPersonas(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="notas" className="text-sm font-medium">Notas para la empresa (opcional)</label>
            <textarea id="notas" name="notas" rows={3} maxLength={500} className={control} />
          </div>

          <FormErrors errors={state?.errors} />
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={!valido || pending}
              aria-describedby="aviso-reserva"
              className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Enviando…" : "Confirmar reserva"}
            </button>
            <p id="aviso-reserva" aria-live="polite" className="text-sm text-cafe-500">{aviso}</p>
          </div>
        </>
      )}
    </form>
  );
}

/** La API crea la reserva en estado pendiente: la empresa todavía debe aceptarla. */
function Confirmacion({
  reserva,
  direccion,
  lugarId,
  onCerrar,
}: {
  reserva: Reserva;
  direccion: string;
  lugarId: number;
  onCerrar?: () => void;
}) {
  const listo = "rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover";

  return (
    <div role="status" className="text-center">
      <h3 className="text-2xl font-bold">¡Solicitud enviada!</h3>
      <p className="mt-2">
        {reserva.lugar.nombre} · {formatoFecha(reserva.fecha)} a las {reserva.hora_inicio}
      </p>
      <p className="text-sm text-cafe-500">
        {reserva.servicio.nombre} · {reserva.cantidad_personas} {reserva.cantidad_personas === 1 ? "persona" : "personas"}
      </p>
      {/* Destacado: la reserva todavía no está confirmada. Mismo color que el estado "Pendiente". */}
      <p className="mt-4 rounded-xl border-2 border-amber-500 bg-amber-100 px-4 py-3 text-base font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
        <span aria-hidden="true">⏳ </span>
        Queda pendiente hasta que {reserva.empresa.nombre_comercial} la acepte.
      </p>
      <p className="mt-3 text-sm text-cafe-500">{direccion}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/dashboard/cliente/reservas" onClick={onCerrar} className="rounded-full border border-cafe-300 px-5 py-2 text-sm hover:border-primary dark:border-cafe-700">
          Ver mis reservas
        </Link>
        {onCerrar ? (
          <button type="button" onClick={onCerrar} className={listo}>Listo</button>
        ) : (
          <Link href={`/lugares/${lugarId}`} className={listo}>Listo</Link>
        )}
      </div>
    </div>
  );
}
