import Link from "next/link";
import { Suspense } from "react";
import { DashboardCargando } from "@/components/role-dashboard";
import { listarLugares } from "@/lib/lugares";

export const metadata = { title: "Lugares turísticos" };

export default function LugaresPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6">
      <h1 className="mb-6 text-2xl font-bold">Lugares turísticos</h1>
      <Suspense fallback={<DashboardCargando />}>
        <Catalogo />
      </Suspense>
    </main>
  );
}

async function Catalogo() {
  const res = await listarLugares();
  if (!res.ok) {
    return <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar el catálogo: {res.error}</p>;
  }
  if (res.data.length === 0) {
    return <p className="text-cafe-500">Aún no hay lugares disponibles. Vuelve pronto.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {res.data.map((l) => (
        <li key={l.id}>
          <Link href={`/lugares/${l.id}`} className="block h-full overflow-hidden rounded-lg border border-cafe-200 hover:border-primary dark:border-cafe-800">
            {l.imagenes[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={l.imagenes[0].url} alt="" className="h-40 w-full object-cover" />
            )}
            <div className="p-4">
              <h2 className="font-semibold">{l.nombre}</h2>
              <p className="text-sm text-cafe-500">{l.ciudad} · {l.empresa.nombre_comercial}</p>
              <p className="mt-2 line-clamp-3 text-sm text-cafe-600 dark:text-cafe-400">{l.descripcion}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
