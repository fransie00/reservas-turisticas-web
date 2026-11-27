import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/dal";
import { obtenerMiEmpresa } from "@/lib/empresas";
import type { Usuario } from "@/lib/types";

const pildora = "rounded-full border border-cafe-200 px-4 py-2 font-medium hover:border-primary dark:border-cafe-800";

export async function NavUser() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <Link href="/login" className="hover:underline">Iniciar sesión</Link>
        <Link href="/registro" className="rounded-md bg-primary px-3 py-1.5 font-medium text-white hover:bg-primary-hover">
          Registrarse
        </Link>
      </div>
    );
  }

  if (user.rol === "cliente") {
    return (
      <Barra user={user}>
        <Link href="/lugares" className={pildora}>Inicio</Link>
        <Link href="/dashboard/cliente/empresas" className={pildora}>Empresas turísticas</Link>
        <Link href="/dashboard/cliente/reservas" className={pildora}>Mis reservas</Link>
      </Barra>
    );
  }

  if (user.rol === "empresa") {
    // Sin aprobación, las pantallas de gestión no están disponibles: no se ofrecen.
    const empresa = await obtenerMiEmpresa();
    const aprobada = empresa.ok && empresa.data?.verificada;
    return (
      <Barra user={user}>
        <Link href="/dashboard/empresa/perfil" className={pildora}>Perfil de Empresa</Link>
        {aprobada && (
          <>
            <Link href="/dashboard/empresa/lugares" className={pildora}>Lugares Turísticos</Link>
            <Link href="/dashboard/empresa/servicios" className={pildora}>Servicios</Link>
            <Link href="/dashboard/empresa/disponibilidad" className={pildora}>Disponibilidad</Link>
            <Link href="/dashboard/empresa/solicitudes" className={pildora}>Solicitudes de Reserva</Link>
          </>
        )}
      </Barra>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href="/dashboard" className="font-medium hover:underline">{user.nombre_completo}</Link>
      <form action={logout}>
        <button type="submit" className="text-cafe-600 hover:underline dark:text-cafe-400">
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}

/** Barra de botones: las secciones propias del rol y, al final, las comunes. */
function Barra({ user, children }: { user: Usuario; children: React.ReactNode }) {
  return (
    <nav aria-label="Principal" className="flex flex-wrap items-center justify-end gap-2 text-sm">
      {children}
      <Link href="/perfil" className={`${pildora} flex items-center gap-2`} title={user.nombre_completo}>
        <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-white">
          {user.nombre_completo.charAt(0).toUpperCase()}
        </span>
        Mi perfil
      </Link>
      {user.rol === "cliente" && <Pronto>Notificaciones</Pronto>}
      <form action={logout}>
        <button type="submit" className="px-2 text-cafe-600 hover:underline dark:text-cafe-400">Cerrar sesión</button>
      </form>
    </nav>
  );
}

function Pronto({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" disabled title="Próximamente" className="cursor-not-allowed rounded-full border border-dashed border-cafe-300 px-4 py-2 text-cafe-500 dark:border-cafe-700">
      {children} <span className="text-xs">(pronto)</span>
    </button>
  );
}
