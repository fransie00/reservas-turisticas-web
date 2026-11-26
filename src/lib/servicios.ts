import "server-only";
import { notFound } from "next/navigation";
import { apiFetch } from "./api";
import type { Cargado } from "./empresas";
import { getSessionToken } from "./session";
import type { Servicio } from "./types";

export async function listarMisServicios(): Promise<Cargado<Servicio[]>> {
  const res = await apiFetch<Servicio[]>("/servicios/mios", { token: await getSessionToken() });
  return res.ok ? { ok: true, data: res.data } : { ok: false, error: res.messages[0] };
}

export async function obtenerMiServicio(id: string): Promise<Cargado<Servicio>> {
  if (!/^[1-9]\d{0,8}$/.test(id)) notFound();
  const res = await apiFetch<Servicio>(`/servicios/mios/${id}`, { token: await getSessionToken() });
  if (res.ok) return { ok: true, data: res.data };
  if (res.status === 404) notFound();
  return { ok: false, error: res.messages[0] };
}
