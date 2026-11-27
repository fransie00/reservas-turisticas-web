import "server-only";
import { notFound, redirect } from "next/navigation";
import { apiFetch, type ApiResult } from "./api";
import { verifyRole } from "./dal";
import { obtenerMiEmpresa, type Cargado } from "./empresas";
import { getSessionToken } from "./session";
import type { Lugar, LugarDetalle, LugarCatalogo } from "./types";


/** Para las páginas de gestión: rol `empresa` y aprobada; si no, vuelve a una vista autorizada. */
export async function verificarEmpresaAprobada(): Promise<void> {
  await verifyRole("empresa");
  const res = await obtenerMiEmpresa();
  if (!res.ok || !res.data?.verificada) redirect("/dashboard/empresa");
}

const comoCargado = <T>(res: ApiResult<T>): Cargado<T> =>
  res.ok ? { ok: true, data: res.data } : { ok: false, error: res.messages[0] };

/** 404 (o un id que no es número) muestra la página de no encontrado. */
function oNoEncontrado<T>(res: ApiResult<T>): Cargado<T> {
  if (!res.ok && (res.status === 404 || res.status === 400)) notFound();
  return comoCargado(res);
}

const esId = (id: string): boolean => /^[1-9]\d{0,8}$/.test(id);

export async function listarMisLugares(): Promise<Cargado<Lugar[]>> {
  return comoCargado(
    await apiFetch<Lugar[]>("/lugares/mios", { token: await getSessionToken() }),
  );
}

export async function obtenerMiLugar(id: string): Promise<Cargado<Lugar>> {
  if (!esId(id)) notFound();
  return oNoEncontrado(
    await apiFetch<Lugar>(`/lugares/mios/${id}`, { token: await getSessionToken() }),
  );
}

export async function listarLugares(): Promise<Cargado<LugarCatalogo[]>> {
  return comoCargado(await apiFetch<LugarCatalogo[]>("/lugares"));
}

export async function obtenerLugar(id: string): Promise<Cargado<LugarDetalle>> {
  if (!esId(id)) notFound();
  return oNoEncontrado(await apiFetch<LugarDetalle>(`/lugares/${id}`));
}
