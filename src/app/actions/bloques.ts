"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, type ApiResult } from "@/lib/api";
import { deleteSession, getSessionToken } from "@/lib/session";
import type { FormState } from "./auth";

const LISTADO = "/dashboard/empresa/disponibilidad/bloques";

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
