import "server-only";
import { apiFetch } from "./api";
import type { Cargado } from "./empresas";
import { getSessionToken } from "./session";
import type { Solicitud } from "./types";

export async function listarSolicitudes(): Promise<Cargado<Solicitud[]>> {
  const res = await apiFetch<Solicitud[]>("/solicitudes", { token: await getSessionToken() });
  return res.ok ? { ok: true, data: res.data } : { ok: false, error: res.messages[0] };
}
