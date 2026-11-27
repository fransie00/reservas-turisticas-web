/** 90 → "1 h 30 min" */
export function formatoDuracion(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return [h && `${h} h`, m && `${m} min`].filter(Boolean).join(" ");
}

const fechas = new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeZone: "UTC" });

/** "2026-12-05" → "5 de diciembre de 2026". En UTC para que el día no se corra por la zona horaria. */
export const formatoFecha = (fecha: string): string => fechas.format(new Date(`${fecha}T00:00:00Z`));

const pesos = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });

export const formatoPrecio = (precio: number): string => pesos.format(precio);

/** El precio es referencial: en la plataforma no se cobra. */
export const textoValorReferencial = (precio: number): string =>
  `Valor referencial: ${formatoPrecio(precio)} por persona, se paga el día de la visita.`;

/** Hoy (`YYYY-MM-DD`) en Chile, aunque el servidor corra en UTC. */
export const hoyEnChile = (): string =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Santiago" }).format(new Date());

const meses = new Intl.DateTimeFormat("es-CL", { month: "long", year: "numeric", timeZone: "UTC" });

/** "2026-12" → "diciembre de 2026" */
export const formatoMes = (mes: string): string => meses.format(new Date(`${mes}-01T00:00:00Z`));

/** "2026-12" + 1 → "2027-01" */
export function sumarMeses(mes: string, cantidad: number): string {
  const fecha = new Date(`${mes}-01T00:00:00Z`);
  fecha.setUTCMonth(fecha.getUTCMonth() + cantidad);
  return fecha.toISOString().slice(0, 7);
}

/** "2026-12" → "2026-12-31" */
export function ultimoDia(mes: string): string {
  const fecha = new Date(`${sumarMeses(mes, 1)}-01T00:00:00Z`);
  fecha.setUTCDate(0);
  return fecha.toISOString().slice(0, 10);
}
