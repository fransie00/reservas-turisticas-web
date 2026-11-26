"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { deleteSession, getSessionToken } from "@/lib/session";
import type { FormState } from "./auth";

/** Solicita la reserva. La API decide el rol y si todavía quedan cupos. */
export async function crearReserva(
  lugarId: number,
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const bloque = Number(formData.get("bloque_id"));
  if (!bloque || !Number.isInteger(lugarId)) return { errors: ["Selecciona una fecha y un horario"] };

  const res = await apiFetch("/reservas", {
    method: "POST",
    token,
    body: {
      bloque_id: bloque,
      cantidad_personas: Number(formData.get("cantidad_personas")),
      notas: String(formData.get("notas") ?? "").trim() || undefined,
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    if (res.status === 403) redirect("/dashboard");
    // Vuelve a consultar la disponibilidad: puede que el horario se haya agotado.
    revalidatePath(`/lugares/${lugarId}/reservar`);
    return { errors: res.messages };
  }

  revalidatePath(`/lugares/${lugarId}/reservar`);
  revalidatePath("/dashboard/cliente/reservas");
  redirect("/dashboard/cliente/reservas");
}
