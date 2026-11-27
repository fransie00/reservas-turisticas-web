/** `?servicio=id` de la lista de horarios, ya validado. */
export function filtroServicio(valor: string | string[] | undefined): { id: number | null; consulta: string } {
  const id = typeof valor === "string" && /^[1-9]\d{0,8}$/.test(valor) ? Number(valor) : null;
  return { id, consulta: id ? `?servicio=${id}` : "" };
}
