import { Suspense } from "react";
import { DashboardCargando, RoleDashboard } from "@/components/role-dashboard";

export const metadata = { title: "Panel de administración" };

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <RoleDashboard
        rol="admin"
        descripcion="Gestiona usuarios y aprueba las empresas que solicitan acceso."
        secciones={[
          { titulo: "Usuarios", descripcion: "Activar, desactivar y asignar roles." },
          { titulo: "Aprobación de empresas", descripcion: "Revisa las solicitudes y da acceso a la plataforma.", href: "/dashboard/admin/empresas" },
          { titulo: "Mi perfil", descripcion: "Revisa los datos de tu cuenta.", href: "/perfil" },
        ]}
      />
    </Suspense>
  );
}
