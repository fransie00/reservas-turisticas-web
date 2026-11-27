import Link from "next/link";
import { Suspense } from "react";
import { BOTON_RESERVAR } from "@/components/estilos";
import { ReservaModal } from "@/components/reserva-modal";
import { DashboardCargando } from "@/components/role-dashboard";
import { Contacto, ServiciosLugar } from "@/components/servicios-lugar";
import { obtenerLugar } from "@/lib/lugares";

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
        {l.servicios.length > 0 && (
          <div className="mt-3">
            <ReservaModal lugarId={l.id} className={BOTON_RESERVAR} />
          </div>
        )}
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
        <dt className="text-cafe-500">Contacto</dt>
        <dd><Contacto contacto={l.empresa.contacto} /></dd>
      </dl>
      <section aria-labelledby="servicios" className="flex flex-col gap-3">
        <h2 id="servicios" className="text-lg font-semibold">Servicios</h2>
        <ServiciosLugar servicios={l.servicios} detallado />
      </section>
    </article>
  );
}
