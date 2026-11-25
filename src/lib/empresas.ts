import "server-only";
import { apiFetch } from "./api";
import { getSessionToken } from "./session";
import type { EmpresaAdmin, EmpresaPrivada, EmpresaPublica } from "./types";

export type Cargado<T> = { ok: true; data: T } | { ok: false; error: string };

const comoCargado = <T>(
  res: Awaited<ReturnType<typeof apiFetch<T>>>,
): Cargado<T> =>
  res.ok ? { ok: true, data: res.data } : { ok: false, error: res.messages[0] };

export async function listarEmpresasVerificadas(): Promise<Cargado<EmpresaPublica[]>> {
  return comoCargado(await apiFetch<EmpresaPublica[]>("/empresas"));
}

/** Perfil de la empresa del usuario. `data` es null si todavía no lo ha creado. */
export async function obtenerMiEmpresa(): Promise<Cargado<EmpresaPrivada | null>> {
  const res = await apiFetch<EmpresaPrivada>("/empresas/mi-empresa", {
    token: await getSessionToken(),
  });
  if (res.ok) return { ok: true, data: res.data };
  if (res.status === 404) return { ok: true, data: null };
  return { ok: false, error: res.messages[0] };
}

export async function listarTodasLasEmpresas(): Promise<Cargado<EmpresaAdmin[]>> {
  return comoCargado(
    await apiFetch<EmpresaAdmin[]>("/empresas/admin/todas", { token: await getSessionToken() }),
  );
}
