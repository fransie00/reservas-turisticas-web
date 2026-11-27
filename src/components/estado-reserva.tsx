import type { EstadoReserva } from "@/lib/types";

/** El estado se distingue por texto, símbolo y color (no depende solo del color). */
const ESTADOS: Record<EstadoReserva, { etiqueta: string; simbolo: string; clases: string }> = {
  pendiente: { etiqueta: "Pendiente", simbolo: "…", clases: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300" },
  aceptada: { etiqueta: "Aceptada", simbolo: "✓", clases: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-300" },
  rechazada: { etiqueta: "Rechazada", simbolo: "✕", clases: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300" },
  cancelada: { etiqueta: "Cancelada", simbolo: "–", clases: "bg-cafe-100 text-cafe-700 dark:bg-cafe-800 dark:text-cafe-300" },
};

export function EstadoReservaBadge({ estado }: { estado: EstadoReserva }) {
  const { etiqueta, simbolo, clases } = ESTADOS[estado];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${clases}`}>
      <span aria-hidden="true">{simbolo} </span>
      <span className="sr-only">Estado: </span>
      {etiqueta}
    </span>
  );
}
