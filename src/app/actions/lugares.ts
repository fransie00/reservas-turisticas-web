"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, type ApiResult } from "@/lib/api";
import { deleteSession, getSessionToken } from "@/lib/session";
import type { FormState } from "./auth";

const LISTADO = "/dashboard/empresa/lugares";

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

/** Crea (id null) o actualiza un lugar turístico. */
export async function guardarLugar(
  id: number | null,
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const token = await exigirToken();
  if (id !== null && !Number.isInteger(id)) return { errors: ["Lugar no válido"] };

  const cuerpo = new FormData();
  for (const campo of ["nombre", "descripcion", "direccion", "ciudad", "capacidad"]) {
    cuerpo.set(campo, String(formData.get(campo) ?? "").trim());
  }

  const horarios = formData.getAll("dias").map((dia) => ({
    dia: Number(dia),
    apertura: String(formData.get(`apertura_${dia}`) ?? ""),
    cierre: String(formData.get(`cierre_${dia}`) ?? ""),
  }));
  cuerpo.set("horarios", JSON.stringify(horarios));

  // Un input de archivos vacío igual envía un archivo de tamaño 0.
  for (const archivo of formData.getAll("imagenes")) {
    if (archivo instanceof File && archivo.size > 0) cuerpo.append("imagenes", archivo);
  }
  if (id !== null) {
    cuerpo.set(
      "eliminar_imagenes",
      JSON.stringify(formData.getAll("eliminar_imagenes").map(Number)),
    );
  }

  const res = await apiFetch(id === null ? "/lugares" : `/lugares/${id}`, {
    method: id === null ? "POST" : "PUT",
    token,
    body: cuerpo,
  });
  await revisarAcceso(res);
  if (!res.ok) {
    return {
      errors: res.status === 413 ? ["Cada imagen puede pesar como máximo 5 MB"] : res.messages,
    };
  }

  revalidatePath(LISTADO);
  redirect(LISTADO);
}

export async function eliminarLugar(id: number): Promise<FormState> {
  const token = await exigirToken();
  if (!Number.isInteger(id)) return { errors: ["Lugar no válido"] };

  const res = await apiFetch(`/lugares/${id}`, { method: "DELETE", token });
  await revisarAcceso(res);
  if (!res.ok) return { errors: res.messages };

  revalidatePath(LISTADO);
  return {};
}
