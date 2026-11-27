"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { listarDisponibilidad } from "@/lib/disponibilidad";
import { hoyEnChile } from "@/lib/formato";
import { deleteSession, getSessionToken } from "@/lib/session";
import type { BloqueDisponible, BloquesDelMes, LugarDetalle, Reserva } from "@/lib/types";

export interface ReservaState {
  errors?: string[];
  /** Disponibilidad vuelta a consultar tras un error: puede que el horario se haya agotado. */
  disponibilidad?: Disponibilidad;
  /** Solicitud creada. */
  reserva?: Reserva;
}

export type Disponibilidad = BloquesDelMes<BloqueDisponible>;

export type DatosReserva =
  | { ok: true; lugar: LugarDetalle; disponibilidad: Disponibilidad; hoy: string }
  | { ok: false; error: string };

/** Datos que necesita la ventana de reserva; se piden al abrirla para que estén al día. */
export async function cargarReserva(lugarId: number): Promise<DatosReserva> {
  if (!Number.isInteger(lugarId) || lugarId < 1) return { ok: false, error: "Lugar no válido" };

  const token = await getSessionToken();
  const [lugar, disponibilidad] = await Promise.all([
    apiFetch<LugarDetalle>(`/lugares/${lugarId}`, { token }),
    listarDisponibilidad(lugarId),
  ]);
  if (!lugar.ok) return { ok: false, error: lugar.messages[0] };
  if (!disponibilidad.ok) return { ok: false, error: disponibilidad.error };
  return { ok: true, lugar: lugar.data, disponibilidad: disponibilidad.data, hoy: hoyEnChile() };
}

/** Otro mes del calendario. */
export async function cargarMes(lugarId: number, mes: string): Promise<Disponibilidad | null> {
  if (!Number.isInteger(lugarId) || lugarId < 1 || !/^\d{4}-\d{2}$/.test(mes)) return null;
  const res = await listarDisponibilidad(lugarId, mes);
  return res.ok ? res.data : null;
}

/** Solicita la reserva. La API decide el rol y si todavía quedan cupos. */
export async function crearReserva(
  lugarId: number,
  _prev: ReservaState | undefined,
  formData: FormData,
): Promise<ReservaState> {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const bloque = Number(formData.get("bloque_id"));
  if (!bloque || !Number.isInteger(lugarId)) return { errors: ["Selecciona una fecha y un horario"] };

  const ruts = formData.getAll("acompanante_rut");
  const acompanantes = formData.getAll("acompanante_nombre").map((nombre, i) => ({
    nombre_completo: String(nombre).trim(),
    rut: String(ruts[i] ?? "").trim(),
  }));

  const res = await apiFetch<Reserva>("/reservas", {
    method: "POST",
    token,
    body: {
      bloque_id: bloque,
      cantidad_personas: Number(formData.get("cantidad_personas")),
      notas: String(formData.get("notas") ?? "").trim() || undefined,
      acompanantes,
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    if (res.status === 403) redirect("/dashboard");
    const mes = String(formData.get("mes") ?? "") || undefined;
    const disponibilidad = await listarDisponibilidad(lugarId, mes);
    return { errors: res.messages, disponibilidad: disponibilidad.ok ? disponibilidad.data : undefined };
  }

  revalidatePath("/lugares");
  revalidatePath(`/lugares/${lugarId}/reservar`);
  revalidatePath("/dashboard/cliente/reservas");
  return { reserva: res.data };
}
