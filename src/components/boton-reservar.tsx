import Link from "next/link";
import type { RolNombre } from "@/lib/types";
import { ReservaModal } from "./reserva-modal";

const clases = "inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover";

/** Solo un cliente reserva: sin sesión se invita a iniciarla; empresa y admin no ven el botón. */
export function BotonReservar({ lugarId, rol }: { lugarId: number; rol?: RolNombre }) {
  if (rol === "cliente") {
    return <ReservaModal lugarId={lugarId} className={clases} />;
  }
  if (!rol) {
    return <Link href="/login" className={clases}>Inicia sesión para reservar</Link>;
  }
  return null;
}
