"use client";

import { startTransition, useActionState, useState } from "react";
import { crearReserva } from "@/app/actions/reservas";
import { formatoDuracion, formatoFecha, formatoPrecio } from "@/lib/formato";
import type { BloqueDisponible, ServicioPublico } from "@/lib/types";
import { Calendario } from "./calendario";
import { Field, FormErrors } from "./form-ui";

const control =
  "rounded-md border border-cafe-300 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-cafe-700";

export function ReservaForm({
  lugarId,
  hoy,
  diasAtencion,
  servicios,
  bloques,
}: {
  lugarId: number;
  hoy: string;
  diasAtencion: number[];
  /** Solo los reservables. */
  servicios: ServicioPublico[];
  bloques: BloqueDisponible[];
}) {
  const [state, action, pending] = useActionState(crearReserva.bind(null, lugarId), undefined);
  const [servicioId, setServicioId] = useState(servicios.length === 1 ? servicios[0].id : 0);
  const [fecha, setFecha] = useState<string>();
  const [bloqueId, setBloqueId] = useState<number>();
  const [personas, setPersonas] = useState("1");

  const delServicio = bloques.filter((b) => b.servicio_id === servicioId);
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

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
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

      <fieldset disabled={!servicioId} className="flex flex-col gap-2 disabled:opacity-60">
        <legend className="mb-2 text-sm font-medium">Fecha</legend>
        <Calendario
          hoy={hoy}
          diasAtencion={diasAtencion}
          conCupos={new Set(delServicio.map((b) => b.fecha))}
          valor={fecha}
          onElegir={(f) => {
            setFecha(f);
            setBloqueId(undefined);
          }}
        />
      </fieldset>

      {servicioId > 0 && fecha && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Horarios del {formatoFecha(fecha)}</legend>
          {delDia.length === 0 ? (
            <p role="status" className="text-sm text-cafe-500">No hay horarios disponibles para esta fecha. Prueba con otra.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {delDia.map((b) => (
                <label key={b.id} className="cursor-pointer rounded-md border border-cafe-300 px-3 py-2 text-sm has-checked:border-primary has-checked:ring-1 has-checked:ring-primary dark:border-cafe-700">
                  <input type="radio" name="bloque_id" value={b.id} checked={elegido?.id === b.id} onChange={() => setBloqueId(b.id)} className="mr-2" />
                  {b.hora_inicio} a {b.hora_fin}
                  <span className="ml-2 text-cafe-500">{b.cupos_disponibles} {b.cupos_disponibles === 1 ? "cupo" : "cupos"}</span>
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
      <div className="flex flex-col items-start gap-2">
        <button
          type="submit"
          disabled={!valido || pending}
          aria-describedby="aviso-reserva"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Confirmar reserva"}
        </button>
        <p id="aviso-reserva" aria-live="polite" className="text-sm text-cafe-500">{aviso}</p>
      </div>
    </form>
  );
}
