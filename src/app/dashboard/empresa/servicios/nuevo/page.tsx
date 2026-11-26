import Link from "next/link";
import { Suspense } from "react";
import { DashboardCargando } from "@/components/role-dashboard";
import { ServicioForm } from "@/components/servicio-form";
import { listarMisLugares, verificarEmpresaAprobada } from "@/lib/lugares";

export const metadata = { title: "Nuevo servicio" };

export default function NuevoServicioPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <NuevoServicio />
    </Suspense>
  );
}

async function NuevoServicio() {
  await verificarEmpresaAprobada();
  const lugares = await listarMisLugares();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Nuevo servicio</h1>
      {!lugares.ok ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudieron cargar tus lugares: {lugares.error}</p>
      ) : lugares.data.length === 0 ? (
        <p className="text-cafe-500">
          Primero necesitas un lugar turístico.{" "}
          <Link href="/dashboard/empresa/lugares/nuevo" className="text-accent hover:underline">Crear lugar</Link>
        </p>
      ) : (
        <ServicioForm lugares={lugares.data.map(({ id, nombre }) => ({ id, nombre }))} />
      )}
    </div>
  );
}
