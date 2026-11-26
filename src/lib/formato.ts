/** 90 → "1 h 30 min" */
export function formatoDuracion(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return [h && `${h} h`, m && `${m} min`].filter(Boolean).join(" ");
}

const pesos = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });

export const formatoPrecio = (precio: number): string => pesos.format(precio);
