import "server-only";
import { apiFetch } from "./api";
import type { Cargado } from "./empresas";
import { getSessionToken } from "./session";
import type { Horario, Impacto, ResumenServicio, SalidasSueltas } from "./types";

async function consultar<T>(ruta: string): Promise<Cargado<T>> {
  const res = await apiFetch<T>(ruta, { token: await getSessionToken() });
  return res.ok ? { ok: true, data: res.data } : { ok: false, error: res.messages[0] };
}

export const listarHorarios = () => consultar<Horario[]>("/horarios/mios");
export const listarSueltas = () => consultar<SalidasSueltas[]>("/horarios/sueltas");
/** Llamar solo con el id de un horario propio ya encontrado. */
export const verImpacto = (id: number) => consultar<Impacto>(`/horarios/${id}/impacto`);
export const resumirServicios = () => consultar<ResumenServicio[]>("/horarios/resumen");

const dias = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

/** Junta los días con las mismas horas: [{ dias: [1..5], horas }, { dias: [6, 7], horas }] */
export function agruparSalidas(salidas: Horario["salidas"]): { dias: number[]; horas: string[] }[] {
  const grupos = new Map<string, { dias: number[]; horas: string[] }>();
  for (const { dia, horas } of salidas) {
    const clave = horas.join();
    const grupo = grupos.get(clave) ?? { dias: [], horas };
    grupo.dias.push(dia);
    grupos.set(clave, grupo);
  }
  return [...grupos.values()];
}

export const nombrarDias = (lista: number[]): string => lista.map((d) => dias[d - 1]).join(", ");
