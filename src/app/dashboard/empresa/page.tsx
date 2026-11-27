import Link from "next/link";
import { Suspense } from "react";
import { DashboardCargando, RoleDashboard } from "@/components/role-dashboard";
import { verifyRole } from "@/lib/dal";
import { obtenerMiEmpresa } from "@/lib/empresas";

export const metadata = { title: "Panel de empresa" };

export default function EmpresaDashboardPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <PanelEmpresa />
    </Suspense>
  );
}

/** El panel completo solo se muestra cuando un administrador aprobó la empresa. */
async function PanelEmpresa() {
  await verifyRole("empresa");
  const res = await obtenerMiEmpresa();

  if (!res.ok) {
    return <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar tu panel: {res.error}</p>;
  }
  if (!res.data?.verificada) return <CuentaPendiente tienePerfil={res.data !== null} />;

  return (
    <RoleDashboard
      rol="empresa"
      descripcion="Administra tu oferta turística y responde a las solicitudes de tus clientes."
      secciones={[
        { titulo: "Perfil de la empresa", descripcion: "Datos comerciales, ubicación y categoría.", href: "/dashboard/empresa/perfil" },
        { titulo: "Lugares turísticos", descripcion: "Configura los lugares que ofreces.", href: "/dashboard/empresa/lugares" },
        { titulo: "Servicios", descripcion: "Crea y edita tus experiencias: duración, precio y estado.", href: "/dashboard/empresa/servicios" },
        { titulo: "Disponibilidad", descripcion: "Crea horarios reutilizables y aplícalos a tus servicios.", href: "/dashboard/empresa/disponibilidad" },
        { titulo: "Solicitudes de reserva", descripcion: "Acepta o rechaza las solicitudes pendientes." },
        { titulo: "Notificaciones", descripcion: "Avisos de nuevas solicitudes." },
        { titulo: "Mi perfil", descripcion: "Revisa los datos de tu cuenta.", href: "/perfil" },
      ]}
    />
  );
}

function CuentaPendiente({ tienePerfil }: { tienePerfil: boolean }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-cafe-200 p-6 dark:border-cafe-800">
      <h1 className="text-2xl font-bold">
        {tienePerfil ? "Tu empresa está pendiente de aprobación" : "Completa los datos de tu empresa"}
      </h1>
      <p className="text-cafe-600 dark:text-cafe-400">
        {tienePerfil
          ? "Un administrador revisará tus datos. Cuando te apruebe podrás configurar tus lugares turísticos."
          : "Para solicitar acceso a la plataforma, envía los datos de tu empresa. Un administrador los revisará."}
      </p>
      <Link href="/dashboard/empresa/perfil" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
        {tienePerfil ? "Revisar mis datos" : "Completar datos"}
      </Link>
    </div>
  );
}
