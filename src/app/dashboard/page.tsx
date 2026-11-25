import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardCargando } from "@/components/role-dashboard";
import { verifySession } from "@/lib/dal";
import { DASHBOARD_POR_ROL } from "@/lib/roles";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardCargando />}>
      <RedirigirPorRol />
    </Suspense>
  );
}

/** /dashboard solo despacha al dashboard del rol del usuario. */
async function RedirigirPorRol(): Promise<null> {
  const user = await verifySession();
  redirect(DASHBOARD_POR_ROL[user.rol]);
}
