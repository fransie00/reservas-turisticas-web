"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import { guardarServicio } from "@/app/actions/servicios";
import type { Servicio } from "@/lib/types";
import { Field, FormErrors, SubmitButton } from "./form-ui";

const control =
  "rounded-md border border-cafe-300 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-cafe-700";

/** `lugares` son solo los de la propia empresa (los entrega la API). */
export function ServicioForm({ servicio, lugares }: { servicio?: Servicio; lugares: { id: number; nombre: string }[] }) {
  const [state, action, pending] = useActionState(
    guardarServicio.bind(null, servicio?.id ?? null),
    undefined,
  );

  /** Se envía a mano para que React no vacíe el formulario cuando la API responde con errores. */
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    startTransition(() => action(datos));
  }

  return (
    <form onSubmit={enviar} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="lugar_id" className="text-sm font-medium">Lugar turístico</label>
        {/* Si el lugar actual fue eliminado, se obliga a elegir otro. */}
        <select id="lugar_id" name="lugar_id" required defaultValue={servicio?.lugar.activo ? servicio.lugar.id : ""} className={control}>
          <option value="" disabled>Selecciona un lugar</option>
          {lugares.map((l) => (
            <option key={l.id} value={l.id}>{l.nombre}</option>
          ))}
        </select>
      </div>
      <Field id="nombre" label="Nombre" defaultValue={servicio?.nombre} maxLength={150} required />
      <div className="flex flex-col gap-1">
        <label htmlFor="descripcion" className="text-sm font-medium">Descripción</label>
        <textarea id="descripcion" name="descripcion" rows={4} maxLength={2000} required defaultValue={servicio?.descripcion} className={control} />
      </div>
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Duración estimada</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field id="horas" label="Horas" type="number" min={0} max={720} step={1} defaultValue={servicio ? Math.floor(servicio.duracion_minutos / 60) : ""} />
          <Field id="minutos" label="Minutos" type="number" min={0} max={59} step={1} defaultValue={servicio ? servicio.duracion_minutos % 60 : ""} />
        </div>
      </fieldset>
      <Field id="precio" label="Precio de referencia (CLP)" type="number" min={0} step={1} defaultValue={servicio?.precio} required />

      <FormErrors errors={state?.errors} />
      <div className="flex items-center gap-4">
        <SubmitButton pending={pending}>{servicio ? "Guardar cambios" : "Crear servicio"}</SubmitButton>
        <Link href="/dashboard/empresa/servicios" className="text-sm hover:underline">Cancelar</Link>
      </div>
    </form>
  );
}
