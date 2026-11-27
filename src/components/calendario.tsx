"use client";

import { formatoFecha, formatoMes, sumarMeses } from "@/lib/formato";

const MESES_ADELANTE = 12;
const SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
const flecha = "rounded-md border border-cafe-300 px-3 py-1 text-sm disabled:opacity-40 dark:border-cafe-700";

/** Solo se pueden elegir las fechas con bloques publicados (`conCupos`). */
export function Calendario({
  hoy,
  mes,
  conCupos,
  cargando,
  valor,
  onElegir,
  onMes,
}: {
  hoy: string;
  /** `YYYY-MM` */
  mes: string;
  conCupos: Set<string>;
  cargando: boolean;
  valor?: string;
  onElegir: (fecha: string) => void;
  onMes: (mes: string) => void;
}) {
  const actual = hoy.slice(0, 7);
  const primero = new Date(`${mes}-01T00:00:00Z`);
  const dias = new Date(Date.UTC(primero.getUTCFullYear(), primero.getUTCMonth() + 1, 0)).getUTCDate();
  const vacios = (primero.getUTCDay() + 6) % 7;

  return (
    <div className="w-full max-w-xs" aria-busy={cargando}>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" aria-label="Mes anterior" disabled={cargando || mes <= actual} onClick={() => onMes(sumarMeses(mes, -1))} className={flecha}>←</button>
        <p aria-live="polite" className="text-sm font-semibold first-letter:uppercase">{formatoMes(mes)}</p>
        <button type="button" aria-label="Mes siguiente" disabled={cargando || mes >= sumarMeses(actual, MESES_ADELANTE)} onClick={() => onMes(sumarMeses(mes, 1))} className={flecha}>→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {SEMANA.map((d) => (
          <span key={d} aria-hidden="true" className="text-xs text-cafe-500">{d}</span>
        ))}
        {Array.from({ length: vacios }, (_, i) => <span key={`vacio-${i}`} />)}
        {Array.from({ length: dias }, (_, i) => {
          const fecha = `${mes}-${String(i + 1).padStart(2, "0")}`;
          const habilitado = !cargando && conCupos.has(fecha);
          return (
            <button
              key={fecha}
              type="button"
              disabled={!habilitado}
              aria-pressed={valor === fecha}
              aria-label={`${formatoFecha(fecha)}${habilitado ? ", con horarios disponibles" : ", sin horarios"}`}
              onClick={() => onElegir(fecha)}
              className={`h-9 rounded-md border ${
                valor === fecha
                  ? "border-primary bg-primary font-semibold text-white"
                  : habilitado
                    ? "border-primary font-semibold hover:bg-accent-soft"
                    : "cursor-not-allowed border-transparent text-cafe-500 opacity-40"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <p role="status" className="mt-2 text-xs text-cafe-500">
        {cargando ? "Cargando…" : conCupos.size ? "Los días destacados tienen horarios disponibles." : "No hay horarios en este mes."}
      </p>
    </div>
  );
}
