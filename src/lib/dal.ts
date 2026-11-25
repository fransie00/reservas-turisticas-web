import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { apiFetch } from "./api";
import { getSessionToken } from "./session";
import type { Usuario } from "./types";

/** Usuario de la sesión actual (o null). Se valida contra la API en cada petición. */
export const getCurrentUser = cache(async (): Promise<Usuario | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  const res = await apiFetch<Usuario>("/auth/profile", { token });
  return res.ok ? res.data : null;
});

/** Para páginas protegidas: sin sesión válida limpia la cookie y envía al login. */
export async function verifySession(): Promise<Usuario> {
  const user = await getCurrentUser();
  if (!user) redirect("/sesion-expirada");
  return user;
}
