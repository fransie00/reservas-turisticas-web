import { Suspense } from "react";
import { DashboardCargando, RoleDashboard } from "@/components/role-dashboard";

export const metadata = { title: "Panel de empresa · Reservas Turísticas" };

export default function EmpresaDashboardPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <RoleDashboard
        rol="empresa"
        descripcion="Administra tu oferta turística y responde a las solicitudes de tus clientes."
        secciones={[
          { titulo: "Perfil de la empresa", descripcion: "Datos comerciales, ubicación y categoría.", href: "/dashboard/empresa/perfil" },
          { titulo: "Servicios", descripcion: "Crea y edita tus experiencias: duración, precio y estado." },
          { titulo: "Bloques horarios", descripcion: "Publica fechas, horarios y cupos disponibles." },
          { titulo: "Solicitudes de reserva", descripcion: "Acepta o rechaza las solicitudes pendientes." },
          { titulo: "Notificaciones", descripcion: "Avisos de nuevas solicitudes." },
          { titulo: "Mi perfil", descripcion: "Revisa los datos de tu cuenta.", href: "/perfil" },
        ]}
      />
    </Suspense>
  );
}
