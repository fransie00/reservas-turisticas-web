import "server-only";
import { apiFetch } from "./api";
import type { Cargado } from "./empresas";
import { getSessionToken } from "./session";
import type { Reserva } from "./types";

export async function listarMisReservas(): Promise<Cargado<Reserva[]>> {
  const res = await apiFetch<Reserva[]>("/reservas/mias", { token: await getSessionToken() });
  return res.ok ? { ok: true, data: res.data } : { ok: false, error: res.messages[0] };
}
