import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { apiFetch } from "./api";
import { getSessionToken, leerToken } from "./session";
import { DASHBOARD_POR_ROL } from "./roles";
import type { RolNombre, Usuario } from "./types";

/** Usuario de la sesión actual (o null). Se valida contra la API en cada petición. */
export const getCurrentUser = cache(async (): Promise<Usuario | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  const res = await apiFetch<Usuario>("/auth/profile", { token });
  // Si el rol cambió desde que se emitió el token, hay que iniciar sesión de nuevo:
  // el proxy redirige según el token y se produciría un bucle.
  return res.ok && res.data.rol === leerToken(token).rol ? res.data : null;
});

/** Para páginas protegidas: sin sesión válida limpia la cookie y envía al login. */
export async function verifySession(): Promise<Usuario> {
  const user = await getCurrentUser();
  if (!user) redirect("/sesion-expirada");
  return user;
}

/**
 * Exige sesión válida y uno de los roles indicados. Si el rol no corresponde,
 * manda al usuario a su propio dashboard en lugar de mostrarle un error.
 */
export async function verifyRole(...roles: RolNombre[]): Promise<Usuario> {
  const user = await verifySession();
  if (!roles.includes(user.rol)) redirect(DASHBOARD_POR_ROL[user.rol]);
  return user;
}
