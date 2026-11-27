import { redirect } from "next/navigation";

/** El cliente no tiene panel: entra directo al catálogo y navega desde la barra superior. */
export default function ClientePage() {
  redirect("/lugares");
}
