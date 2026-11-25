"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSessionToken } from "@/lib/session";
import type { EmpresaPrivada } from "@/lib/types";
import type { FormState } from "./auth";

const texto = (formData: FormData, campo: string): string =>
  String(formData.get(campo) ?? "").trim();

/** La empresa crea o actualiza su perfil. */
export async function guardarEmpresa(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const values = {
    rut: texto(formData, "rut"),
    nombre_comercial: texto(formData, "nombre_comercial"),
    categoria: texto(formData, "categoria"),
    ciudad: texto(formData, "ciudad"),
    direccion: texto(formData, "direccion"),
    descripcion: texto(formData, "descripcion"),
  };

  const res = await apiFetch<EmpresaPrivada>("/empresas/mi-empresa", {
    method: "PUT",
    token,
    body: {
      ...values,
      direccion: values.direccion || undefined,
      descripcion: values.descripcion || undefined,
    },
  });
  if (!res.ok) return { errors: res.messages, values };

  revalidatePath("/dashboard/empresa/perfil");
  return { message: "Perfil guardado correctamente", values };
}

/** El admin verifica o quita la verificación de una empresa. */
export async function cambiarVerificacion(formData: FormData): Promise<void> {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const id = Number(formData.get("id"));
  const verificada = formData.get("verificada") === "true";
  if (!Number.isInteger(id)) return;

  await apiFetch(`/empresas/${id}/verificacion`, {
    method: "PATCH",
    token,
    body: { verificada },
  });
  revalidatePath("/dashboard/admin/empresas");
}
