import "server-only";
import { apiFetch } from "./api";
import type { Cargado } from "./empresas";
import { getSessionToken } from "./session";
import type { Bloque, BloqueDisponible } from "./types";

/** Llamar solo con un id ya validado (por ejemplo, después de `obtenerLugar`). */
export async function listarDisponibilidad(lugarId: number): Promise<Cargado<BloqueDisponible[]>> {
  const res = await apiFetch<BloqueDisponible[]>(`/lugares/${lugarId}/disponibilidad`);
  return res.ok ? { ok: true, data: res.data } : { ok: false, error: res.messages[0] };
}

export async function listarMisBloques(): Promise<Cargado<Bloque[]>> {
  const res = await apiFetch<Bloque[]>("/bloques/mios", { token: await getSessionToken() });
  return res.ok ? { ok: true, data: res.data } : { ok: false, error: res.messages[0] };
}
