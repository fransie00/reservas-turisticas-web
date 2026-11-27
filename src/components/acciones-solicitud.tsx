"use client";

import { useRef, useState, useTransition } from "react";
import { aceptarSolicitud, rechazarSolicitud } from "@/app/actions/solicitudes";
import { boton, control } from "./estilos";
import { FormErrors } from "./form-ui";

const secundario = "rounded-md border border-cafe-300 px-3 py-1.5 text-sm hover:border-primary dark:border-cafe-700";
const peligro = "rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60";
const ventana = "m-auto w-full max-w-sm rounded-lg bg-background p-6 text-foreground backdrop:bg-black/50";

/** Botones "Aceptar" y "Rechazar" de una solicitud pendiente, ambos con confirmación. */
export function AccionesSolicitud({ id, resumen }: { id: number; resumen: string }) {
  const aceptar = useRef<HTMLDialogElement>(null);
  const rechazar = useRef<HTMLDialogElement>(null);
  const [motivo, setMotivo] = useState("");
  const [errores, setErrores] = useState<string[]>();
  const [pendiente, iniciar] = useTransition();

  function abrir(dialogo: HTMLDialogElement | null) {
    setErrores(undefined);
    dialogo?.showModal();
  }

  function confirmarAceptacion() {
    iniciar(async () => setErrores((await aceptarSolicitud(id)).errors));
  }

  function confirmarRechazo(e: React.FormEvent) {
    e.preventDefault();
    if (pendiente) return;
    if (!motivo.trim()) {
      setErrores(["Es obligatorio escribir el motivo del rechazo"]);
      return;
    }
    iniciar(async () => setErrores((await rechazarSolicitud(id, motivo)).errors));
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" onClick={() => abrir(aceptar.current)} aria-label={`Aceptar solicitud de ${resumen}`} className={boton}>
        Aceptar
      </button>
      <button type="button" onClick={() => abrir(rechazar.current)} aria-label={`Rechazar solicitud de ${resumen}`} className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950">
        Rechazar
      </button>

      <dialog ref={aceptar} aria-labelledby={`aceptar-${id}`} className={ventana}>
        <h2 id={`aceptar-${id}`} className="font-semibold">¿Aceptar esta solicitud?</h2>
        <p className="mt-2 text-sm">{resumen}. Después no podrás cambiar la respuesta.</p>
        <div className="mt-3"><FormErrors errors={errores} /></div>
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={() => aceptar.current?.close()} className={secundario}>Cancelar</button>
          <button type="button" disabled={pendiente} onClick={confirmarAceptacion} className={boton}>
            {pendiente ? "Aceptando…" : "Sí, aceptar"}
          </button>
        </div>
      </dialog>

      <dialog ref={rechazar} aria-labelledby={`rechazar-${id}`} className={ventana}>
        <h2 id={`rechazar-${id}`} className="font-semibold">Rechazar solicitud</h2>
        <p className="mt-2 text-sm">{resumen}. Después no podrás cambiar la respuesta.</p>
        <form onSubmit={confirmarRechazo} noValidate className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor={`motivo-${id}`} className="text-sm font-medium">Motivo del rechazo (obligatorio)</label>
            <textarea id={`motivo-${id}`} rows={3} maxLength={500} required value={motivo} onChange={(e) => { setMotivo(e.target.value); setErrores(undefined); }} className={control} />
            <p className="text-xs text-cafe-500">El cliente lo verá en sus reservas.</p>
          </div>
          <FormErrors errors={errores} />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => rechazar.current?.close()} className={secundario}>Cancelar</button>
            <button type="submit" disabled={pendiente} className={peligro}>
              {pendiente ? "Rechazando…" : "Confirmar rechazo"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
