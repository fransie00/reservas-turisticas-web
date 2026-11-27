"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { deleteSession, getSessionToken } from "@/lib/session";
import type { FormState } from "./auth";

/** La API decide el rol, la propiedad y que la solicitud siga pendiente. */
async function responder(id: number, accion: "aceptar" | "rechazar", body?: unknown): Promise<FormState> {
  const token = await getSessionToken();
  if (!token) redirect("/login");
  if (!Number.isInteger(id) || id < 1) return { errors: ["Solicitud no válida"] };

  const res = await apiFetch(`/solicitudes/${id}/${accion}`, { method: "PATCH", token, body });
  if (!res.ok) {
    if (res.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    if (res.status === 403) redirect("/dashboard");
  }

  // También tras un 409: la lista debe mostrar el estado real.
  revalidatePath("/dashboard/empresa/solicitudes");
  revalidatePath("/dashboard/cliente/reservas");
  return res.ok ? {} : { errors: res.messages };
}

export async function aceptarSolicitud(id: number): Promise<FormState> {
  return responder(id, "aceptar");
}

export async function rechazarSolicitud(id: number, motivo: string): Promise<FormState> {
  const texto = String(motivo).trim();
  if (!texto) return { errors: ["Es obligatorio escribir el motivo del rechazo"] };
  return responder(id, "rechazar", { motivo: texto });
}
