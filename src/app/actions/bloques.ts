"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, type ApiResult } from "@/lib/api";
import { deleteSession, getSessionToken } from "@/lib/session";
import type { FormState } from "./auth";

const LISTADO = "/dashboard/empresa/disponibilidad";

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

export async function publicarBloque(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const token = await exigirToken();
  const texto = (campo: string) => String(formData.get(campo) ?? "");

  const res = await apiFetch("/bloques", {
    method: "POST",
    token,
    body: {
      servicio_id: Number(texto("servicio_id")),
      fecha: texto("fecha"),
      hora_inicio: texto("hora_inicio"),
      hora_fin: texto("hora_fin"),
      cupos: Number(texto("cupos")),
    },
  });
  await revisarAcceso(res);
  if (!res.ok) return { errors: [...new Set(res.messages)] };

  revalidatePath(LISTADO);
  return { message: "Bloque publicado" };
}

export async function cambiarEstadoBloque(
  id: number,
  estado: "disponible" | "cerrado",
): Promise<FormState> {
  const token = await exigirToken();
  if (!Number.isInteger(id)) return { errors: ["Bloque no válido"] };

  const res = await apiFetch(`/bloques/${id}/estado`, { method: "PATCH", token, body: { estado } });
  await revisarAcceso(res);
  if (!res.ok) return { errors: res.messages };

  revalidatePath(LISTADO);
  return {};
}
