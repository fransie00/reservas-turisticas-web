import { Suspense } from "react";
import { verifySession } from "@/lib/dal";

export const metadata = { title: "Mi perfil · Reservas Turísticas" };

export default function PerfilPage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 p-6">
      <h1 className="mb-6 text-2xl font-bold">Mi perfil</h1>
      {/* La sesión se lee en cada petición, por eso va detrás de Suspense */}
      <Suspense fallback={<p className="text-zinc-500">Cargando…</p>}>
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
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
      {filas.map(([etiqueta, valor]) => (
        <div key={etiqueta} className="contents">
          <dt className="text-sm text-zinc-500">{etiqueta}</dt>
          <dd className="font-medium">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}
