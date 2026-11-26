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
