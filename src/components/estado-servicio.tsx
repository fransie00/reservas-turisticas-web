"use client";

import { startTransition, useActionState } from "react";
import { cambiarEstadoServicio } from "@/app/actions/servicios";
import type { EstadoServicio } from "@/lib/types";
import { FormErrors } from "./form-ui";

const ESTADOS: Record<EstadoServicio, string> = {
  disponible: "Disponible",
  pausado: "No disponible / Pausado",
  cancelado: "Cancelado",
};

/** Cambia el estado apenas se elige en la lista. */
export function EstadoServicioSelect({ id, nombre, estado }: { id: number; nombre: string; estado: EstadoServicio }) {
  const [state, action, pending] = useActionState(
    (_prev: unknown, nuevo: EstadoServicio) => cambiarEstadoServicio(id, nuevo),
    undefined,
  );

  return (
    <div className="flex flex-col gap-1">
      {/* key: vuelve a mostrar el estado guardado cuando cambia en el servidor */}
      <select
        key={estado}
        aria-label={`Estado de ${nombre}`}
        defaultValue={estado}
        disabled={pending}
        onChange={(e) => {
          const nuevo = e.target.value as EstadoServicio;
          startTransition(() => action(nuevo));
        }}
        className="rounded-md border border-cafe-300 bg-background px-2 py-1.5 text-sm disabled:opacity-60 dark:border-cafe-700"
      >
        {Object.entries(ESTADOS).map(([valor, etiqueta]) => (
          <option key={valor} value={valor}>{etiqueta}</option>
        ))}
      </select>
      <FormErrors errors={state?.errors} />
    </div>
  );
}
