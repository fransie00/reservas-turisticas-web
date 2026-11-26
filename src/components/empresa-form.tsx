"use client";

import { useActionState } from "react";
import { guardarEmpresa } from "@/app/actions/empresas";
import type { EmpresaPrivada } from "@/lib/types";
import { Field, FormErrors, SubmitButton } from "./form-ui";

export function EmpresaForm({ empresa }: { empresa: EmpresaPrivada | null }) {
  const [state, action, pending] = useActionState(guardarEmpresa, undefined);
  const v = state?.values ?? {
    rut: empresa?.rut ?? "",
    nombre_comercial: empresa?.nombre_comercial ?? "",
    categoria: empresa?.categoria ?? "",
    ciudad: empresa?.ciudad ?? "",
    direccion: empresa?.direccion ?? "",
    descripcion: empresa?.descripcion ?? "",
  };

  return (
    <form action={action} className="flex max-w-lg flex-col gap-4">
      <FormErrors errors={state?.errors} />
      {state?.message && (
        <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          {state.message}
        </p>
      )}
      <Field id="nombre_comercial" label="Nombre comercial" defaultValue={v.nombre_comercial} required />
      <Field id="rut" label="RUT de la empresa" placeholder="76543210-3" defaultValue={v.rut} readOnly={empresa?.verificada} required />
      <Field id="categoria" label="Categoría" placeholder="Aventura, gastronomía, cultura…" defaultValue={v.categoria} required />
      <Field id="ciudad" label="Ciudad" defaultValue={v.ciudad} required />
      <Field id="direccion" label="Dirección (opcional)" defaultValue={v.direccion} />
      <div className="flex flex-col gap-1">
        <label htmlFor="descripcion" className="text-sm font-medium">Descripción (opcional)</label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={4}
          maxLength={1000}
          defaultValue={v.descripcion}
          className="rounded-md border border-cafe-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-cafe-700"
        />
      </div>
      <SubmitButton pending={pending}>{empresa ? "Guardar cambios" : "Crear perfil"}</SubmitButton>
    </form>
  );
}
