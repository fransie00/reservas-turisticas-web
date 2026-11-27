import "server-only";
import { apiFetch } from "./api";
import type { Cargado } from "./empresas";
import { getSessionToken } from "./session";
import type { Bloque, BloqueDisponible, BloquesDelMes } from "./types";

const consulta = (mes?: string) => (mes ? `?mes=${encodeURIComponent(mes)}` : "");

/** Llamar solo con un id ya validado. Sin `mes`, llega el del primer bloque disponible. */
export async function listarDisponibilidad(lugarId: number, mes?: string): Promise<Cargado<BloquesDelMes<BloqueDisponible>>> {
  const res = await apiFetch<BloquesDelMes<BloqueDisponible>>(`/lugares/${lugarId}/disponibilidad${consulta(mes)}`);
  return res.ok ? { ok: true, data: res.data } : { ok: false, error: res.messages[0] };
}

export async function listarMisBloques(mes?: string): Promise<Cargado<BloquesDelMes<Bloque>>> {
  const res = await apiFetch<BloquesDelMes<Bloque>>(`/bloques/mios${consulta(mes)}`, { token: await getSessionToken() });
  return res.ok ? { ok: true, data: res.data } : { ok: false, error: res.messages[0] };
}
