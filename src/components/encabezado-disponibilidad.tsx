import Link from "next/link";
import { Volver } from "./volver";

const BASE = "/dashboard/empresa/disponibilidad";
const PESTANAS = [
  { clave: "resumen", titulo: "Resumen", href: BASE },
  { clave: "horarios", titulo: "Horarios", href: `${BASE}/horarios` },
  { clave: "bloques", titulo: "Bloques publicados", href: `${BASE}/bloques` },
] as const;

export function EncabezadoDisponibilidad({ activa }: { activa: (typeof PESTANAS)[number]["clave"] }) {
  return (
    <div>
      {activa === "resumen" ? (
        <Volver href="/dashboard/empresa">Volver al panel</Volver>
      ) : (
        <Volver href={BASE}>Volver al resumen</Volver>
      )}
      <h1 className="mt-2 text-2xl font-bold">Disponibilidad</h1>
      <nav aria-label="Disponibilidad" className="mt-3 flex flex-wrap gap-5 border-b border-cafe-200 text-sm dark:border-cafe-800">
        {PESTANAS.map((p) => (
          <Link key={p.clave} href={p.href} aria-current={p.clave === activa ? "page" : undefined} className="border-b-2 border-transparent pb-2 aria-[current=page]:border-primary aria-[current=page]:font-semibold">
            {p.titulo}
          </Link>
        ))}
      </nav>
    </div>
  );
}
