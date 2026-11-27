import { Suspense } from "react";
import { LugarForm } from "@/components/lugar-form";
import { DashboardCargando } from "@/components/role-dashboard";
import { verificarEmpresaAprobada } from "@/lib/lugares";

export const metadata = { title: "Nuevo lugar turístico" };

export default function NuevoLugarPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <NuevoLugar />
    </Suspense>
  );
}

async function NuevoLugar() {
  await verificarEmpresaAprobada();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Nuevo lugar turístico</h1>
      <LugarForm />
    </div>
  );
}
