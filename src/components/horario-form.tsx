"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { guardarHorario } from "@/app/actions/horarios";
import type { EstadoServicio, SalidasDia } from "@/lib/types";
import { atajo, boton, control, ficha, tarjeta } from "./estilos";
import { Field, FormErrors } from "./form-ui";

const SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

const aMinutos = (hora: string) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));
const aHora = (m: number) => [Math.floor(m / 60), m % 60].map((n) => String(n).padStart(2, "0")).join(":");

/** Salidas desde la primera hasta la última, cada `cada` minutos. */
function generar(primera: string, ultima: string, cada: number): string[] {
  if (!primera || !ultima || !(cada >= 5)) return [];
  const horas = [];
  for (let m = aMinutos(primera); m <= aMinutos(ultima) && horas.length < 48; m += cada) horas.push(aHora(m));
  return horas;
}

const alternar = <T,>(lista: T[], valor: T) =>
  lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];

/** Días que comparten las mismas salidas. Apagar una hora no la quita de la lista. */
interface Grupo {
  id: number;
  dias: number[];
  primera: string;
  ultima: string;
  cada: string;
  sueltas: string[];
  apagadas: string[];
}

const opcionesDe = (g: Grupo) => [...new Set([...generar(g.primera, g.ultima, Number(g.cada)), ...g.sueltas])].sort();
const activasDe = (g: Grupo) => opcionesDe(g).filter((h) => !g.apagadas.includes(h));

const grupoNuevo = (id: number, dias: number[]): Grupo => ({
  id, dias, primera: "10:00", ultima: "15:00", cada: "60", sueltas: [], apagadas: [],
});

export function HorarioForm({
  id,
  nombreInicial = "",
  grupos: iniciales,
  servicios,
  asignados = [],
  filtro,
}: {
  /** null = horario nuevo. */
  id: number | null;
  nombreInicial?: string;
  grupos?: { dias: number[]; horas: string[] }[];
  /** Todos los de la empresa. Los pausados se muestran, pero no se pueden marcar. */
  servicios: { id: number; nombre: string; estado: EstadoServicio; lugar: { nombre: string } }[];
  asignados?: number[];
  /** Servicio desde cuya lista se llegó; se vuelve a ella. */
  filtro: number | null;
}) {
  const activos = servicios.filter((s) => s.estado === "disponible");
  const [elegidos, setElegidos] = useState(() => {
    // Al editar se conservan los ya asignados, aunque estén pausados.
    const marcables = id === null ? activos : servicios;
    const previos = asignados.filter((a) => marcables.some((s) => s.id === a));
    return !previos.length && activos.length === 1 ? [activos[0].id] : previos;
  });
  const [nombre, setNombre] = useState(nombreInicial);
  const [grupos, setGrupos] = useState<Grupo[]>(() =>
    iniciales
      ? iniciales.map((g, i) => ({ ...grupoNuevo(i, g.dias), primera: "", ultima: "", sueltas: g.horas }))
      : [grupoNuevo(0, [1, 2, 3, 4, 5, 6, 7])],
  );
  const [errores, setErrores] = useState<string[]>();
  const [guardando, iniciar] = useTransition();

  const cambiar = (grupo: number, cambio: Partial<Grupo>) =>
    setGrupos((actuales) => actuales.map((g) => (g.id === grupo ? { ...g, ...cambio } : g)));
  const usados = grupos.flatMap((g) => g.dias);
  const falta = !nombre.trim()
    ? "Ponle un nombre al horario."
    : !elegidos.length
      ? "Marca para qué servicios es este horario."
      : grupos.some((g) => g.dias.length === 0)
      ? "Cada grupo necesita al menos un día."
      : grupos.some((g) => activasDe(g).length === 0)
        ? "Cada grupo necesita al menos una salida activa."
        : undefined;

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (falta || guardando) return;
    const salidas: SalidasDia[] = grupos.flatMap((g) => g.dias.map((dia) => ({ dia, horas: activasDe(g) })));
    iniciar(async () => setErrores((await guardarHorario(id, nombre, elegidos, salidas, filtro))?.errors));
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-4">
      <div className="max-w-sm">
        <Field id="nombre" label="Nombre del horario" placeholder="Temporada alta" maxLength={80} value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">¿Para qué servicios es?</legend>
        <div className="flex flex-wrap gap-2">
          {servicios.map((s) => (
            <label key={s.id} className={ficha}>
              <input type="checkbox" className="sr-only" disabled={s.estado !== "disponible"} checked={elegidos.includes(s.id)} onChange={() => setElegidos(alternar(elegidos, s.id))} />
              {s.nombre} ({s.lugar.nombre}){s.estado === "pausado" && " · pausado: actívalo en «Servicios»"}
            </label>
          ))}
        </div>
      </fieldset>

      {grupos.map((g, i) => (
        <Salidas
          key={g.id}
          grupo={g}
          numero={i + 1}
          ocupados={usados.filter((d) => !g.dias.includes(d))}
          onCambiar={(cambio) => cambiar(g.id, cambio)}
          onQuitar={grupos.length > 1 ? () => setGrupos(grupos.filter((x) => x.id !== g.id)) : undefined}
        />
      ))}

      <div>
        <button
          type="button"
          className={atajo}
          disabled={grupos.length >= 7}
          onClick={() => setGrupos([...grupos, grupoNuevo(Math.max(...grupos.map((g) => g.id)) + 1, [])])}
        >
          + Otros días con horas distintas
        </button>
        <p className="text-xs text-cafe-500">Un día solo puede estar en un grupo: para moverlo, desmárcalo primero en el otro.</p>
      </div>

      <FormErrors errors={errores} />
      <p role="status" className="text-sm text-cafe-500">{falta}</p>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={!!falta || guardando} className={boton}>
          {guardando ? "Guardando…" : id === null ? "Guardar y publicar fechas" : "Guardar cambios"}
        </button>
        <Link href={`/dashboard/empresa/disponibilidad/horarios${filtro ? `?servicio=${filtro}` : ""}`} className="text-sm hover:underline">Cancelar</Link>
      </div>
    </form>
  );
}

function Salidas({
  grupo,
  numero,
  ocupados,
  onCambiar,
  onQuitar,
}: {
  grupo: Grupo;
  numero: number;
  ocupados: number[];
  onCambiar: (cambio: Partial<Grupo>) => void;
  onQuitar?: () => void;
}) {
  const [suelta, setSuelta] = useState("");

  function agregar() {
    if (!suelta) return;
    onCambiar({ sueltas: [...grupo.sueltas, suelta], apagadas: grupo.apagadas.filter((h) => h !== suelta) });
    setSuelta("");
  }

  return (
    <fieldset className={`${tarjeta} flex flex-col gap-3`}>
      <legend className="px-1 text-sm font-medium">Grupo {numero}</legend>
      <div role="group" aria-label="Días" className="flex flex-wrap items-center gap-2">
        {SEMANA.map((nombre, i) => (
          <label key={nombre} className={ficha}>
            <input type="checkbox" className="sr-only" disabled={ocupados.includes(i + 1)} checked={grupo.dias.includes(i + 1)} onChange={() => onCambiar({ dias: alternar(grupo.dias, i + 1).sort() })} />
            {nombre}
          </label>
        ))}
        {onQuitar && <button type="button" onClick={onQuitar} className={`ml-auto ${atajo}`}>Quitar grupo</button>}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="flex items-center gap-2">Desde <input type="time" value={grupo.primera} onChange={(e) => onCambiar({ primera: e.target.value })} className={control} /></label>
        <label className="flex items-center gap-2">hasta <input type="time" value={grupo.ultima} onChange={(e) => onCambiar({ ultima: e.target.value })} className={control} /></label>
        <label className="flex items-center gap-2">cada <input type="number" min={5} step={5} value={grupo.cada} onChange={(e) => onCambiar({ cada: e.target.value })} className={`${control} w-20`} /> min</label>
      </div>
      <div role="group" aria-label="Salidas" className="flex flex-wrap gap-2">
        {opcionesDe(grupo).map((h) => (
          <label key={h} className={ficha}>
            <input type="checkbox" className="sr-only" checked={!grupo.apagadas.includes(h)} onChange={() => onCambiar({ apagadas: alternar(grupo.apagadas, h) })} />
            {h}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input type="time" aria-label="Hora suelta" value={suelta} onChange={(e) => setSuelta(e.target.value)} className={control} />
        <button type="button" disabled={!suelta} onClick={agregar} className={atajo}>Agregar hora suelta</button>
      </div>
    </fieldset>
  );
}
