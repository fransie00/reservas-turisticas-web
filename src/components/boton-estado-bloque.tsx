"use client";

import { startTransition, useActionState } from "react";
import { cambiarEstadoBloque } from "@/app/actions/bloques";
import { FormErrors } from "./form-ui";

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
