import { Suspense } from "react";
import { DashboardCargando, RoleDashboard } from "@/components/role-dashboard";

export const metadata = { title: "Panel de cliente · Reservas Turísticas" };

export default function ClienteDashboardPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <RoleDashboard
        rol="cliente"
        descripcion="Encuentra experiencias turísticas y gestiona tus reservas."
        secciones={[
          { titulo: "Empresas turísticas", descripcion: "Conoce las empresas verificadas de la plataforma.", href: "/dashboard/cliente/empresas" },
          { titulo: "Mis reservas", descripcion: "Historial y estado: pendiente, aceptada, rechazada o cancelada." },
          { titulo: "Notificaciones", descripcion: "Avisos cuando una empresa responde a tu solicitud." },
          { titulo: "Mi perfil", descripcion: "Revisa los datos de tu cuenta.", href: "/perfil" },
        ]}
      />
    </Suspense>
  );
}
