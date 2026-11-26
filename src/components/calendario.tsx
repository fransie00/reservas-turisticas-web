"use client";

import { useState } from "react";
import { formatoFecha } from "@/lib/formato";

const MESES_ADELANTE = 12;
const SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
const titulo = new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric", timeZone: "UTC" });
const flecha = "rounded-md border border-cafe-300 px-3 py-1 text-sm disabled:opacity-40 dark:border-cafe-700";

/**
 * El `<input type="date">` nativo no permite bloquear días de la semana, por eso este calendario.
 * Solo habilita fechas desde `hoy` cuyo día esté en `diasAtencion` (1 = lunes ... 7 = domingo).
 */
export function Calendario({
  hoy,
  diasAtencion,
  conCupos,
  valor,
  onElegir,
}: {
  hoy: string;
  diasAtencion: number[];
  conCupos: Set<string>;
  valor?: string;
  onElegir: (fecha: string) => void;
}) {
  const [desfase, setDesfase] = useState(0);
  const [anio, mes] = hoy.split("-").map(Number);
  const primero = new Date(Date.UTC(anio, mes - 1 + desfase, 1));
  const dias = new Date(Date.UTC(primero.getUTCFullYear(), primero.getUTCMonth() + 1, 0)).getUTCDate();
  const vacios = (primero.getUTCDay() + 6) % 7;

  return (
    <div className="w-full max-w-xs">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" aria-label="Mes anterior" disabled={desfase === 0} onClick={() => setDesfase(desfase - 1)} className={flecha}>←</button>
        <p aria-live="polite" className="text-sm font-semibold first-letter:uppercase">{titulo.format(primero)}</p>
        <button type="button" aria-label="Mes siguiente" disabled={desfase === MESES_ADELANTE} onClick={() => setDesfase(desfase + 1)} className={flecha}>→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {SEMANA.map((d) => (
          <span key={d} aria-hidden="true" className="text-xs text-cafe-500">{d}</span>
        ))}
        {Array.from({ length: vacios }, (_, i) => <span key={`vacio-${i}`} />)}
        {Array.from({ length: dias }, (_, i) => {
          const dia = new Date(Date.UTC(primero.getUTCFullYear(), primero.getUTCMonth(), i + 1));
          const fecha = dia.toISOString().slice(0, 10);
          const habilitado = fecha >= hoy && diasAtencion.includes(dia.getUTCDay() || 7);
          const hayCupos = habilitado && conCupos.has(fecha);
          return (
            <button
              key={fecha}
              type="button"
              disabled={!habilitado}
              aria-pressed={valor === fecha}
              aria-label={`${formatoFecha(fecha)}${hayCupos ? ", con horarios disponibles" : ""}`}
              onClick={() => onElegir(fecha)}
              className={`relative h-9 rounded-md border ${
                valor === fecha
                  ? "border-primary bg-primary font-semibold text-white"
                  : habilitado
                    ? "border-cafe-300 hover:border-primary dark:border-cafe-700"
                    : "cursor-not-allowed border-transparent text-cafe-500 line-through opacity-40"
              }`}
            >
              {i + 1}
              {hayCupos && <span aria-hidden="true" className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-current" />}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-cafe-500">Los días con punto tienen horarios disponibles.</p>
    </div>
  );
}
