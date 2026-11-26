"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { guardarLugar } from "@/app/actions/lugares";
import type { Lugar } from "@/lib/types";
import { Field, FormErrors, SubmitButton } from "./form-ui";

const MAX_IMAGENES = 5;
const MAX_BYTES = 5 * 1024 * 1024;

const control =
  "rounded-md border border-cafe-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-cafe-700";

/** `dias` llega del servidor para no duplicar la lista. */
export function LugarForm({ lugar, dias }: { lugar?: Lugar; dias: string[] }) {
  const [state, action, pending] = useActionState(
    guardarLugar.bind(null, lugar?.id ?? null),
    undefined,
  );
  const [errorImagenes, setErrorImagenes] = useState<string>();

  /** Se envía a mano para que React no vacíe el formulario cuando la API responde con errores. */
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const nuevas = datos
      .getAll("imagenes")
      .filter((a): a is File => a instanceof File && a.size > 0);
    const total =
      (lugar?.imagenes.length ?? 0) - datos.getAll("eliminar_imagenes").length + nuevas.length;

    let error: string | undefined;
    if (total < 1) error = "Agrega al menos una imagen";
    else if (total > MAX_IMAGENES) error = `Máximo ${MAX_IMAGENES} imágenes por lugar`;
    else if (nuevas.some((a) => a.size > MAX_BYTES)) error = "Cada imagen puede pesar como máximo 5 MB";
    setErrorImagenes(error);
    if (!error) startTransition(() => action(datos));
  }

  return (
    <form onSubmit={enviar} className="flex max-w-lg flex-col gap-4">
      <Field id="nombre" label="Nombre" defaultValue={lugar?.nombre} maxLength={150} required />
      <div className="flex flex-col gap-1">
        <label htmlFor="descripcion" className="text-sm font-medium">Descripción</label>
        <textarea id="descripcion" name="descripcion" rows={4} maxLength={2000} required defaultValue={lugar?.descripcion} className={control} />
      </div>
      <Field id="direccion" label="Dirección" defaultValue={lugar?.direccion} maxLength={200} required />
      <Field id="ciudad" label="Ciudad" defaultValue={lugar?.ciudad} maxLength={80} required />
      <Field id="capacidad" label="Capacidad (cupos)" type="number" min={1} max={10000} defaultValue={lugar?.capacidad} required />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Horarios de atención (marca al menos un día)</legend>
        {dias.map((nombre, i) => (
          <FilaHorario key={nombre} dia={i + 1} nombre={nombre} horario={lugar?.horarios.find((h) => h.dia === i + 1)} />
        ))}
      </fieldset>

      {lugar && lugar.imagenes.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Imágenes actuales</legend>
          <ul className="flex flex-wrap gap-3">
            {lugar.imagenes.map((img, i) => (
              <li key={img.id} className="flex flex-col items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={`Imagen ${i + 1} de ${lugar.nombre}`} className="h-24 w-32 rounded-md object-cover" />
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" name="eliminar_imagenes" value={img.id} />
                  Quitar
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="imagenes" className="text-sm font-medium">{lugar ? "Agregar imágenes" : "Imágenes"}</label>
        <input id="imagenes" name="imagenes" type="file" accept="image/jpeg,image/png,image/webp" multiple required={!lugar} className={control} />
        <p className="text-xs text-cafe-500">JPG, PNG o WebP. Hasta {MAX_IMAGENES} imágenes de 5 MB cada una.</p>
      </div>

      <FormErrors errors={errorImagenes ? [errorImagenes] : state?.errors} />
      <div className="flex items-center gap-4">
        <SubmitButton pending={pending}>{lugar ? "Guardar cambios" : "Crear lugar"}</SubmitButton>
        <Link href="/dashboard/empresa/lugares" className="text-sm hover:underline">Cancelar</Link>
      </div>
    </form>
  );
}

function FilaHorario({ dia, nombre, horario }: { dia: number; nombre: string; horario?: { apertura: string; cierre: string } }) {
  const [abierto, setAbierto] = useState(horario !== undefined);

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className="flex w-28 items-center gap-2">
        <input type="checkbox" name="dias" value={dia} checked={abierto} onChange={(e) => setAbierto(e.target.checked)} />
        {nombre}
      </label>
      <input type="time" name={`apertura_${dia}`} aria-label={`Apertura ${nombre}`} defaultValue={horario?.apertura ?? "09:00"} disabled={!abierto} required={abierto} className={`${control} disabled:opacity-40`} />
      <span>a</span>
      <input type="time" name={`cierre_${dia}`} aria-label={`Cierre ${nombre}`} defaultValue={horario?.cierre ?? "18:00"} disabled={!abierto} required={abierto} className={`${control} disabled:opacity-40`} />
    </div>
  );
}
