import type { Acompanante } from "@/lib/types";

export function ListaAcompanantes({ acompanantes }: { acompanantes: Acompanante[] }) {
  if (acompanantes.length === 0) return null;
  return (
    <div className="mt-3 text-sm">
      <p className="text-cafe-500">Acompañantes</p>
      <ul>
        {acompanantes.map((a, i) => (
          <li key={i}>{a.nombre_completo} · RUT {a.rut}</li>
        ))}
      </ul>
    </div>
  );
}
