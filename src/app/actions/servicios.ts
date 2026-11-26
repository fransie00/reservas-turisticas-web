"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, type ApiResult } from "@/lib/api";
import { deleteSession, getSessionToken } from "@/lib/session";
import type { EstadoServicio } from "@/lib/types";
import type { FormState } from "./auth";

const LISTADO = "/dashboard/empresa/servicios";

async function exigirToken(): Promise<string> {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  return token;
}

/** La API es quien decide los permisos; aquí solo se redirige a una vista autorizada. */
async function revisarAcceso(res: ApiResult<unknown>): Promise<void> {
  if (res.ok) return;
  if (res.status === 401) {
    await deleteSession();
    redirect("/login");
  }
  if (res.status === 403) redirect("/dashboard");
}

/** Crea (id null) o actualiza un servicio. */
export async function guardarServicio(
  id: number | null,
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const token = await exigirToken();
  if (id !== null && !Number.isInteger(id)) return { errors: ["Servicio no válido"] };

  const texto = (campo: string) => String(formData.get(campo) ?? "").trim();
  // Un campo vacío no se envía: así la API lo pide en vez de leerlo como 0.
  const numero = (campo: string) => (texto(campo) === "" ? undefined : Number(texto(campo)));
  const horas = numero("horas");
  const minutos = numero("minutos");

  const res = await apiFetch(id === null ? "/servicios" : `/servicios/${id}`, {
    method: id === null ? "POST" : "PUT",
    token,
    body: {
      lugar_id: numero("lugar_id"),
      nombre: texto("nombre"),
      descripcion: texto("descripcion"),
      // Sin horas ni minutos queda en 0 y la API responde que debe ser mayor que cero.
      duracion_minutos: (horas ?? 0) * 60 + (minutos ?? 0),
      precio: numero("precio"),
    },
  });
  await revisarAcceso(res);
  if (!res.ok) return { errors: [...new Set(res.messages)] };

  revalidatePath(LISTADO);
  redirect(LISTADO);
}

export async function cambiarEstadoServicio(
  id: number,
  estado: EstadoServicio,
): Promise<FormState> {
  const token = await exigirToken();
  if (!Number.isInteger(id)) return { errors: ["Servicio no válido"] };

  const res = await apiFetch(`/servicios/${id}/estado`, {
    method: "PATCH",
    token,
    body: { estado },
  });
  await revisarAcceso(res);
  if (!res.ok) return { errors: res.messages };

  revalidatePath(LISTADO);
  return {};
}
