"use client";

import { startTransition, useActionState, useState } from "react";
import { cambiarEstadoBloque, publicarBloque } from "@/app/actions/bloques";
import { Field, FormErrors, SubmitButton } from "./form-ui";

const control =
  "rounded-md border border-cafe-300 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-cafe-700";

export function BloqueForm({
  hoy,
  servicios,
}: {
  hoy: string;
  /** `horario` es el texto del horario de atención de su lugar. */
  servicios: { id: number; nombre: string; horario: string }[];
}) {
  const [state, action, pending] = useActionState(publicarBloque, undefined);
  const [servicioId, setServicioId] = useState("");
  const horario = servicios.find((s) => String(s.id) === servicioId)?.horario;

  /** Se envía a mano para conservar los datos y publicar varios bloques seguidos. */
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    startTransition(() => action(datos));
  }

  return (
    <form onSubmit={enviar} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="servicio_id" className="text-sm font-medium">Servicio</label>
        <select id="servicio_id" name="servicio_id" required value={servicioId} onChange={(e) => setServicioId(e.target.value)} className={control}>
          <option value="" disabled>Selecciona un servicio</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
        {horario && <p className="text-xs text-cafe-500">Atención: {horario}</p>}
      </div>
      <Field id="fecha" label="Fecha" type="date" min={hoy} required />
      <div className="grid grid-cols-2 gap-3">
        <Field id="hora_inicio" label="Hora de inicio" type="time" required />
        <Field id="hora_fin" label="Hora de término" type="time" required />
      </div>
      <Field id="cupos" label="Cupos" type="number" min={1} step={1} required />
      <FormErrors errors={state?.errors} />
      <p role="status" className="text-sm text-green-800 dark:text-green-300">{pending ? "" : state?.message}</p>
      <div>
        <SubmitButton pending={pending}>Publicar bloque</SubmitButton>
      </div>
    </form>
  );
}

export function BotonEstadoBloque({ id, cerrado, nombre }: { id: number; cerrado: boolean; nombre: string }) {
  const [state, action, pending] = useActionState(
    () => cambiarEstadoBloque(id, cerrado ? "disponible" : "cerrado"),
    undefined,
  );

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        aria-label={`${cerrado ? "Reabrir" : "Cerrar"} bloque ${nombre}`}
        onClick={() => startTransition(() => action())}
        className="rounded-md border border-cafe-300 px-3 py-1.5 text-sm hover:border-primary disabled:opacity-60 dark:border-cafe-700"
      >
        {cerrado ? "Reabrir" : "Cerrar"}
      </button>
      <FormErrors errors={state?.errors} />
    </div>
  );
}
