import Link from "next/link";
import { Suspense } from "react";
import { ReservaForm } from "@/components/reserva-form";
import { DashboardCargando } from "@/components/role-dashboard";
import { getCurrentUser } from "@/lib/dal";
import { listarDisponibilidad } from "@/lib/disponibilidad";
import { hoyEnChile } from "@/lib/formato";
import { DIAS, obtenerLugar } from "@/lib/lugares";

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
  const user = await getCurrentUser();
  const res = await obtenerLugar((await params).id);
  if (!res.ok) return <p role="alert" className={error}>No se pudo cargar el lugar: {res.error}</p>;
  const l = res.data;
  const volver = <Link href={`/lugares/${l.id}`} className="text-sm text-accent hover:underline">← Volver al lugar</Link>;

  if (user?.rol !== "cliente") {
    return (
      <div className="flex flex-col items-start gap-3">
        {volver}
        <h1 className="text-2xl font-bold">Reservar {l.nombre}</h1>
        <p>
          {user
            ? "Solo las cuentas de tipo Cliente pueden reservar."
            : "Para reservar debes iniciar sesión con una cuenta de tipo Cliente."}
        </p>
        {!user && <Link href="/login" className="font-medium text-accent hover:underline">Iniciar sesión</Link>}
      </div>
    );
  }

  const disponibilidad = await listarDisponibilidad(l.id);
  const servicios = l.servicios.filter((s) => s.reservable);

  return (
    <div className="flex flex-col gap-5">
      <div>
        {volver}
        <h1 className="mt-2 text-2xl font-bold">Reservar {l.nombre}</h1>
        <p className="text-cafe-500">Ofrecido por {l.empresa.nombre_comercial}</p>
      </div>
      <section aria-labelledby="horario" className="rounded-lg border border-cafe-200 p-4 text-sm dark:border-cafe-800">
        <h2 id="horario" className="mb-1 font-semibold">Horario general de atención</h2>
        <ul>
          {l.horarios.map((h) => (
            <li key={h.dia}>{DIAS[h.dia - 1]}: {h.apertura} a {h.cierre}</li>
          ))}
        </ul>
        {l.horarios.length === 0 && <p className="text-cafe-500">La empresa aún no publica su horario.</p>}
      </section>

      {!disponibilidad.ok ? (
        <p role="alert" className={error}>No se pudo cargar la disponibilidad: {disponibilidad.error}</p>
      ) : servicios.length === 0 ? (
        <p className="text-cafe-500">Este lugar no tiene servicios disponibles para reservar.</p>
      ) : (
        <ReservaForm
          lugarId={l.id}
          hoy={hoyEnChile()}
          diasAtencion={l.horarios.map((h) => h.dia)}
          servicios={servicios}
          bloques={disponibilidad.data}
        />
      )}
    </div>
  );
}
