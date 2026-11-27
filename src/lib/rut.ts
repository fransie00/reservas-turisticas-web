/** Misma regla que la API: formato y dígito verificador (módulo 11). Acepta puntos y guion. */
export function esRutValido(valor: string): boolean {
  const limpio = valor.replace(/[.\s-]/g, "").toUpperCase();
  if (!/^\d{7,8}[\dK]$/.test(limpio)) return false;
  let suma = 0;
  let multiplicador = 2;
  for (let i = limpio.length - 2; i >= 0; i--) {
    suma += Number(limpio[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  const dv = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  return limpio.endsWith(dv);
}
