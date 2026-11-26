import Link from "next/link";
import { Suspense } from "react";
import { DashboardCargando } from "@/components/role-dashboard";
import { DIAS, obtenerLugar } from "@/lib/lugares";
import { formatoDuracion, formatoPrecio } from "@/lib/formato";

export const metadata = { title: "Lugar turístico" };

export default function LugarPage({ params }: PageProps<"/lugares/[id]">) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6">
      <Link href="/lugares" className="text-sm text-accent hover:underline">← Todos los lugares</Link>
      <Suspense fallback={<DashboardCargando />}>
        <Detalle params={params} />
      </Suspense>
    </main>
  );
}

async function Detalle({ params }: { params: Promise<{ id: string }> }) {
  const res = await obtenerLugar((await params).id);
  if (!res.ok) {
    return <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar el lugar: {res.error}</p>;
  }
  const l = res.data;

  return (
    <article className="mt-3 flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">{l.nombre}</h1>
        <p className="text-cafe-500">Ofrecido por {l.empresa.nombre_comercial}</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {l.imagenes.map((img, i) => (
          <li key={img.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={`Imagen ${i + 1} de ${l.nombre}`} className="h-56 w-full rounded-lg object-cover" />
          </li>
        ))}
      </ul>
      <p className="whitespace-pre-line">{l.descripcion}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-cafe-500">Ubicación</dt>
        <dd>{l.direccion}, {l.ciudad}</dd>
        <dt className="text-cafe-500">Capacidad</dt>
        <dd>{l.capacidad} cupos</dd>
        <dt className="text-cafe-500">Horarios</dt>
        <dd>
          <ul>
            {l.horarios.map((h) => (
              <li key={h.dia}>{DIAS[h.dia - 1]}: {h.apertura} a {h.cierre}</li>
            ))}
          </ul>
        </dd>
      </dl>
      <section aria-labelledby="servicios" className="flex flex-col gap-3">
        <h2 id="servicios" className="text-lg font-semibold">Servicios</h2>
        {l.servicios.length === 0 ? (
          <p className="text-sm text-cafe-500">Este lugar aún no tiene servicios publicados.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {l.servicios.map((s) => (
              <li key={s.id} className={`rounded-lg border border-cafe-200 p-4 dark:border-cafe-800 ${s.reservable ? "" : "opacity-60"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{s.nombre}</h3>
                  <span className="rounded bg-cafe-100 px-2 py-0.5 text-xs dark:bg-cafe-800">
                    {s.reservable ? "Disponible para reservar" : "No disponible"}
                  </span>
                </div>
                <p className="text-sm text-cafe-500">{formatoDuracion(s.duracion_minutos)} · {formatoPrecio(s.precio)} (referencial)</p>
                <p className="mt-2 whitespace-pre-line text-sm">{s.descripcion}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
