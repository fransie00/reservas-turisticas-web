"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { eliminarHorario } from "@/app/actions/horarios";
import { control } from "./estilos";
import { FormErrors } from "./form-ui";

export function EliminarHorarioForm({
  id,
  filtro,
  afectadas,
  volver,
}: {
  id: number;
  filtro: number | null;
  /** Reservas que se cancelarán. */
  afectadas: number;
  volver: string;
}) {
  const [motivo, setMotivo] = useState("");
  const [errores, setErrores] = useState<string[]>();
  const [pendiente, iniciar] = useTransition();
  const falta = afectadas > 0 && !motivo.trim();

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (falta || pendiente) return;
    iniciar(async () => setErrores((await eliminarHorario(id, filtro, motivo))?.errors));
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      {afectadas > 0 && (
        <div className="flex flex-col gap-1">
          <label htmlFor="motivo" className="text-sm font-medium">Motivo de la cancelación (obligatorio)</label>
          <textarea id="motivo" rows={3} maxLength={500} required value={motivo} onChange={(e) => setMotivo(e.target.value)} className={control} />
          <p className="text-xs text-cafe-500">Lo verá cada cliente en sus reservas, junto con el contacto de tu cuenta.</p>
        </div>
      )}
      <FormErrors errors={errores} />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={falta || pendiente} className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60">
          {pendiente ? "Eliminando…" : afectadas > 0 ? `Eliminar y cancelar ${afectadas} ${afectadas === 1 ? "reserva" : "reservas"}` : "Eliminar horario"}
        </button>
        <Link href={volver} className="text-sm hover:underline">No eliminar</Link>
      </div>
    </form>
  );
}
