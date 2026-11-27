"use client";

import { useEffect, useState } from "react";
import { aplicarHorario, type RespuestaAplicacion } from "@/app/actions/horarios";
import { formatoDuracion, formatoMes, sumarMeses, ultimoDia } from "@/lib/formato";
import type { PedidoAplicacion, ResultadoServicio, ResumenServicio } from "@/lib/types";
import { atajo, boton, control, ficha, tarjeta } from "./estilos";
import { FormErrors } from "./form-ui";

type Propio = { cupos?: string; desde?: string; hasta?: string };

function describir(r: ResultadoServicio, verbo: string): string {
  return [
    `${verbo} ${r.bloques} bloques`,
    r.omitidos_existentes && `${r.omitidos_existentes} ya publicados`,
    r.omitidos_pasados && `${r.omitidos_pasados} con la hora ya pasada`,
    r.otras_salidas && `ojo: ya hay ${r.otras_salidas} salidas a otras horas en esas fechas, que se mantienen`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function AplicarForm({
  horarioId,
  hoy,
  servicios,
  marcado,
}: {
  horarioId: number;
  hoy: string;
  servicios: ResumenServicio[];
  /** Servicio que llega preseleccionado. */
  marcado?: number;
}) {
  const esteMes = hoy.slice(0, 7);
  const [elegidos, setElegidos] = useState<number[]>(
    marcado ? [marcado] : servicios.length === 1 ? [servicios[0].id] : [],
  );
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(ultimoDia(esteMes));
  const [propios, setPropios] = useState<Record<number, Propio>>({});
  const [previa, setPrevia] = useState<{ clave: string; res: RespuestaAplicacion }>();
  const [publicado, setPublicado] = useState<{ clave: string; res: RespuestaAplicacion }>();
  const [publicando, setPublicando] = useState(false);
  const [veces, setVeces] = useState(0);

  const filas = servicios
    .filter((s) => elegidos.includes(s.id))
    .map((s) => {
      const propio = propios[s.id] ?? {};
      return {
        servicio: s,
        cupos: propio.cupos ?? String(Math.min(s.cupos ?? s.lugar.capacidad, s.lugar.capacidad)),
        desde: propio.desde ?? desde,
        hasta: propio.hasta ?? hasta,
      };
    });
  const completas: PedidoAplicacion[] = filas
    .filter((f) => Number.isInteger(Number(f.cupos)) && Number(f.cupos) >= 1 && f.desde && f.hasta)
    .map((f) => ({ servicio_id: f.servicio.id, desde: f.desde, hasta: f.hasta, cupos: Number(f.cupos) }));

  const texto = JSON.stringify(completas);
  // Tras publicar se vuelve a calcular: lo recién creado ya existe.
  const clave = `${veces}|${texto}`;
  const actual = previa?.clave === clave ? previa.res : undefined;
  const hecho = publicado?.clave === texto ? publicado.res : undefined;
  const mostrado = hecho ?? actual;
  const resultadoDe = (id: number) => (mostrado?.ok ? mostrado.resultados.find((r) => r.servicio_id === id) : undefined);
  const listos = actual?.ok ? completas.filter((p) => actual.resultados.some((r) => r.servicio_id === p.servicio_id && r.bloques > 0)) : [];
  const total = actual?.ok ? actual.resultados.reduce((suma, r) => suma + r.bloques, 0) : 0;

  useEffect(() => {
    const pedidos = JSON.parse(texto) as PedidoAplicacion[];
    if (!pedidos.length) return;
    let vigente = true;
    const espera = setTimeout(async () => {
      const res = await aplicarHorario(horarioId, pedidos, true);
      if (vigente) setPrevia({ clave, res });
    }, 500);
    return () => {
      vigente = false;
      clearTimeout(espera);
    };
  }, [clave, texto, horarioId]);

  const cambiar = (id: number, cambio: Propio) => setPropios({ ...propios, [id]: { ...propios[id], ...cambio } });

  function fechasComunes(nuevoDesde: string, nuevoHasta: string) {
    setDesde(nuevoDesde);
    setHasta(nuevoHasta);
    // Las fechas comunes reemplazan las que se habían cambiado por fila.
    setPropios(Object.fromEntries(Object.entries(propios).map(([id, p]) => [id, { cupos: p.cupos }])));
  }

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    if (!listos.length || publicando) return;
    setPublicando(true);
    const res = await aplicarHorario(horarioId, listos, false);
    setPublicado({ clave: texto, res });
    setVeces((n) => n + 1);
    setPublicando(false);
  }

  const todos = elegidos.length === servicios.length;

  return (
    <form onSubmit={publicar} className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">1. ¿A qué servicios?</legend>
        <div className="flex flex-wrap gap-2">
          {servicios.map((s) => (
            <label key={s.id} className={ficha}>
              <input type="checkbox" className="sr-only" checked={elegidos.includes(s.id)} onChange={() => setElegidos(elegidos.includes(s.id) ? elegidos.filter((id) => id !== s.id) : [...elegidos, s.id])} />
              {s.nombre} ({s.lugar.nombre})
            </label>
          ))}
        </div>
        {servicios.length > 1 && (
          <button type="button" className={`mt-2 ${atajo}`} onClick={() => setElegidos(todos ? [] : servicios.map((s) => s.id))}>
            {todos ? "Quitar todos" : "Marcar todos"}
          </button>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">2. ¿En qué fechas?</legend>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-2">Del <input type="date" min={hoy} value={desde} onChange={(e) => fechasComunes(e.target.value, hasta)} className={control} /></label>
          <label className="flex items-center gap-2">al <input type="date" min={desde || hoy} value={hasta} onChange={(e) => fechasComunes(desde, e.target.value)} className={control} /></label>
        </div>
        <div className="flex flex-wrap gap-4">
          {[esteMes, sumarMeses(esteMes, 1)].map((mes) => (
            <button key={mes} type="button" className={atajo} onClick={() => fechasComunes(mes === esteMes ? hoy : `${mes}-01`, ultimoDia(mes))}>Todo {formatoMes(mes)}</button>
          ))}
        </div>
      </fieldset>

      {filas.length > 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-sm font-medium">3. Cupos por servicio y vista previa</legend>
          {filas.map((f) => {
            const r = resultadoDe(f.servicio.id);
            const incompleta = !completas.some((p) => p.servicio_id === f.servicio.id);
            return (
              <div key={f.servicio.id} className={tarjeta}>
                <p className="font-semibold">{f.servicio.nombre}</p>
                <p className="text-xs text-cafe-500">{f.servicio.lugar.nombre} · dura {formatoDuracion(f.servicio.duracion_minutos)} · capacidad {f.servicio.lugar.capacidad}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                  <label className="flex items-center gap-2">Cupos <input type="number" min={1} max={f.servicio.lugar.capacidad} value={f.cupos} onChange={(e) => cambiar(f.servicio.id, { cupos: e.target.value })} className={`${control} w-24`} /></label>
                  <label className="flex items-center gap-2">del <input type="date" min={hoy} value={f.desde} onChange={(e) => cambiar(f.servicio.id, { desde: e.target.value })} className={control} /></label>
                  <label className="flex items-center gap-2">al <input type="date" min={f.desde || hoy} value={f.hasta} onChange={(e) => cambiar(f.servicio.id, { hasta: e.target.value })} className={control} /></label>
                </div>
                <p aria-live="polite" className={`mt-2 text-sm ${r?.error ? "text-red-700 dark:text-red-300" : hecho ? "text-green-800 dark:text-green-300" : ""}`}>
                  {incompleta ? "Completa los cupos y las fechas." : r ? (r.error ?? describir(r, hecho ? "Publicados" : "Se crearán")) : hecho ? "Sin cambios." : mostrado ? "" : "Calculando…"}
                </p>
              </div>
            );
          })}
        </fieldset>
      )}

      {mostrado && !mostrado.ok && <FormErrors errors={mostrado.errors} />}
      <div className="flex flex-col items-start gap-1">
        <button type="submit" disabled={!listos.length || publicando || !!hecho} className={boton}>
          {publicando ? "Publicando…" : hecho ? "Publicado" : total > 0 ? `Publicar ${total} bloques` : "Publicar bloques"}
        </button>
        {!hecho && actual?.ok && actual.resultados.some((r) => r.error) && listos.length > 0 && (
          <p className="text-sm text-cafe-500">Los servicios con error se omiten; el resto se publica.</p>
        )}
      </div>
    </form>
  );
}
