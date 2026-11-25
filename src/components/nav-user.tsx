import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/dal";

export async function NavUser() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <Link href="/login" className="hover:underline">Iniciar sesión</Link>
        <Link href="/registro" className="rounded-md bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700">
          Registrarse
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href="/perfil" className="font-medium hover:underline">{user.nombre_completo}</Link>
      <form action={logout}>
        <button type="submit" className="text-zinc-600 hover:underline dark:text-zinc-400">
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
