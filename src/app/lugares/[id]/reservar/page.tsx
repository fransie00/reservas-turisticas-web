import Link from "next/link";
import { Suspense } from "react";
import { ReservaForm } from "@/components/reserva-form";
import { DashboardCargando } from "@/components/role-dashboard";
import { listarDisponibilidad } from "@/lib/disponibilidad";
import { hoyEnChile } from "@/lib/formato";
import { obtenerLugar } from "@/lib/lugares";

export const metadata = { title: "Reservar" };

export default function ReservarPage({ params }: PageProps<"/lugares/[id]/reservar">) {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 p-6">
      <Suspense fallback={<DashboardCargando />}>
        <Reservar params={params} />
      </Suspense>
    </main>
  );
}

const error = "text-sm text-red-700 dark:text-red-300";

async function Reservar({ params }: { params: Promise<{ id: string }> }) {
  const res = await obtenerLugar((await params).id);
  if (!res.ok) return <p role="alert" className={error}>No se pudo cargar el lugar: {res.error}</p>;
  const l = res.data;
  const volver = <Link href={`/lugares/${l.id}`} className="text-sm text-accent hover:underline">← Volver al lugar</Link>;

  const disponibilidad = await listarDisponibilidad(l.id);
  const { servicios } = l;

  return (
    <div className="flex flex-col gap-5">
      <div>
        {volver}
        <h1 className="mt-2 text-2xl font-bold">Reservar {l.nombre}</h1>
        <p className="text-cafe-500">Ofrecido por {l.empresa.nombre_comercial}</p>
      </div>
      {!disponibilidad.ok ? (
        <p role="alert" className={error}>No se pudo cargar la disponibilidad: {disponibilidad.error}</p>
      ) : servicios.length === 0 ? (
        <p className="text-cafe-500">Este lugar no tiene servicios disponibles para reservar.</p>
      ) : (
        <ReservaForm
          lugarId={l.id}
          hoy={hoyEnChile()}
          direccion={`${l.direccion}, ${l.ciudad}`}
          servicios={servicios}
          disponibilidad={disponibilidad.data}
        />
      )}
    </div>
  );
}
