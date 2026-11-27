"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, type ApiResult } from "@/lib/api";
import { deleteSession, getSessionToken } from "@/lib/session";
import type { Horario, PedidoAplicacion, ResultadoServicio, SalidasDia } from "@/lib/types";
import type { FormState } from "./auth";

const BASE = "/dashboard/empresa/disponibilidad";

async function exigirToken(): Promise<string> {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  return token;
}

async function revisarAcceso(res: ApiResult<unknown>): Promise<void> {
  if (res.ok) return;
  if (res.status === 401) {
    await deleteSession();
    redirect("/login");
  }
  if (res.status === 403) redirect("/dashboard");
}

/** Crea (id null) o actualiza. Un horario nuevo continúa en la pantalla para aplicarlo. */
export async function guardarHorario(id: number | null, nombre: string, servicio_ids: number[], salidas: SalidasDia[], filtro: number | null): Promise<FormState> {
  const token = await exigirToken();
  if (id !== null && !Number.isInteger(id)) return { errors: ["Horario no válido"] };

  const res = await apiFetch<Horario>(id === null ? "/horarios" : `/horarios/${id}`, {
    method: id === null ? "POST" : "PUT",
    token,
    body: { nombre, servicio_ids, salidas },
  });
  await revisarAcceso(res);
  if (!res.ok) return { errors: [...new Set(res.messages)] };

  revalidatePath(BASE, "layout");
  const consulta = Number.isInteger(filtro) ? `?servicio=${filtro}` : "";
  redirect(id === null ? `${BASE}/horarios/${res.data.id}/aplicar${consulta}` : `${BASE}/horarios${consulta}`);
}

export async function eliminarHorario(id: number, filtro: number | null, motivo: string): Promise<FormState> {
  const token = await exigirToken();
  if (!Number.isInteger(id)) return { errors: ["Horario no válido"] };

  const res = await apiFetch(`/horarios/${id}/eliminar`, {
    method: "POST",
    token,
    body: { motivo: motivo.trim() || undefined },
  });
  await revisarAcceso(res);
  if (!res.ok) return { errors: res.messages };

  revalidatePath(BASE, "layout");
  revalidatePath("/lugares");
  revalidatePath("/dashboard/cliente/reservas");
  redirect(`${BASE}/horarios${Number.isInteger(filtro) ? `?servicio=${filtro}` : ""}`);
}

export type RespuestaAplicacion = { ok: true; resultados: ResultadoServicio[] } | { ok: false; errors: string[] };

/** Con `simular` solo cuenta lo que se crearía. */
export async function aplicarHorario(id: number, servicios: PedidoAplicacion[], simular: boolean): Promise<RespuestaAplicacion> {
  const token = await exigirToken();
  if (!Number.isInteger(id)) return { ok: false, errors: ["Horario no válido"] };

  const res = await apiFetch<{ resultados: ResultadoServicio[] }>(`/horarios/${id}/aplicar`, {
    method: "POST",
    token,
    body: { servicios, simular },
  });
  await revisarAcceso(res);
  if (!res.ok) return { ok: false, errors: [...new Set(res.messages)] };

  if (!simular) {
    revalidatePath(BASE, "layout");
    revalidatePath("/lugares");
  }
  return { ok: true, resultados: res.data.resultados };
}
