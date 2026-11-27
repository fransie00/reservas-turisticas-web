import { Suspense } from "react";
import { Volver } from "@/components/volver";
import { verifySession } from "@/lib/dal";

export const metadata = { title: "Mi perfil" };

export default function PerfilPage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 p-6">
      <Volver href="/dashboard">Volver</Volver>
      <h1 className="mb-6 mt-3 text-2xl font-bold">Mi perfil</h1>
      {/* La sesión se lee en cada petición, por eso va detrás de Suspense */}
      <Suspense fallback={<p className="text-cafe-500">Cargando…</p>}>
        <DatosPerfil />
      </Suspense>
    </main>
  );
}

async function DatosPerfil() {
  const user = await verifySession();
  const filas: [string, string][] = [
    ["Nombre", user.nombre_completo],
    ["RUT", user.rut],
    ["Email", user.email],
    ["Rol", user.rol],
  ];

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 rounded-lg border border-cafe-200 p-5 dark:border-cafe-800">
      {filas.map(([etiqueta, valor]) => (
        <div key={etiqueta} className="contents">
          <dt className="text-sm text-cafe-500">{etiqueta}</dt>
          <dd className="font-medium">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}
