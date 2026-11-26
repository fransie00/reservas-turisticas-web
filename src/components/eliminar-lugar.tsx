"use client";

import { useActionState, useRef } from "react";
import { eliminarLugar } from "@/app/actions/lugares";
import { FormErrors } from "./form-ui";

/** Botón "Eliminar" con mensaje de advertencia antes de confirmar. */
export function EliminarLugar({ id, nombre }: { id: number; nombre: string }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(eliminarLugar.bind(null, id), undefined);

  return (
    <>
      <button type="button" onClick={() => dialogo.current?.showModal()} className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950">
        Eliminar
      </button>
      <dialog ref={dialogo} aria-labelledby={`eliminar-${id}`} className="m-auto w-full max-w-sm rounded-lg bg-background p-6 text-foreground backdrop:bg-black/50">
        <h2 id={`eliminar-${id}`} className="font-semibold">¿Eliminar «{nombre}»?</h2>
        <p className="mt-2 text-sm">Dejará de aparecer en tu listado y los clientes ya no podrán verlo. Esta acción no se puede deshacer desde la plataforma.</p>
        <div className="mt-3"><FormErrors errors={state?.errors} /></div>
        <form action={action} className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={() => dialogo.current?.close()} className="rounded-md border border-cafe-300 px-3 py-1.5 text-sm dark:border-cafe-700">
            Cancelar
          </button>
          <button type="submit" disabled={pending} className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60">
            {pending ? "Eliminando…" : "Sí, eliminar"}
          </button>
        </form>
      </dialog>
    </>
  );
}
