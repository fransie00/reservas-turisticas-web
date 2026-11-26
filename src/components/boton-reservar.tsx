import Link from "next/link";
import type { RolNombre } from "@/lib/types";

const clases = "inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover";

/** Solo un cliente reserva: sin sesión se invita a iniciarla; empresa y admin no ven el botón. */
export function BotonReservar({ lugarId, rol }: { lugarId: number; rol?: RolNombre }) {
  if (rol === "cliente") {
    return <Link href={`/lugares/${lugarId}/reservar`} className={clases}>Reservar</Link>;
  }
  if (!rol) {
    return <Link href="/login" className={clases}>Inicia sesión para reservar</Link>;
  }
  return null;
}
