import { Suspense } from "react";
import { DashboardCargando, RoleDashboard } from "@/components/role-dashboard";

export const metadata = { title: "Panel de administración · Reservas Turísticas" };

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <RoleDashboard
        rol="admin"
        descripcion="Gestiona usuarios y verifica empresas para la landing pública."
        secciones={[
          { titulo: "Usuarios", descripcion: "Activar, desactivar y asignar roles." },
          { titulo: "Verificación de empresas", descripcion: "Aprueba empresas para que aparezcan en el catálogo." },
          { titulo: "Mi perfil", descripcion: "Revisa los datos de tu cuenta.", href: "/perfil" },
        ]}
      />
    </Suspense>
  );
}
