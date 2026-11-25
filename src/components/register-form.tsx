"use client";

import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import { Field, FormErrors, SubmitButton } from "./form-ui";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);
  const v = state?.values;

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormErrors errors={state?.errors} />
      <Field id="nombre_completo" label="Nombre completo" autoComplete="name" defaultValue={v?.nombre_completo} required />
      <Field id="rut" label="RUT" placeholder="12345678-5" defaultValue={v?.rut} required />
      <Field id="email" label="Email" type="email" autoComplete="email" defaultValue={v?.email} required />
      <Field id="telefono" label="Teléfono (opcional)" type="tel" autoComplete="tel" defaultValue={v?.telefono} />
      <div className="flex flex-col gap-1">
        <label htmlFor="rol" className="text-sm font-medium">Tipo de cuenta</label>
        <select
          id="rol"
          name="rol"
          defaultValue={v?.rol ?? "cliente"}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="cliente">Cliente (turista)</option>
          <option value="empresa">Empresa turística</option>
        </select>
      </div>
      <Field id="password" label="Contraseña (mínimo 8 caracteres)" type="password" autoComplete="new-password" minLength={8} required />
      <Field id="confirmar" label="Confirmar contraseña" type="password" autoComplete="new-password" minLength={8} required />
      <SubmitButton pending={pending}>Crear cuenta</SubmitButton>
    </form>
  );
}
