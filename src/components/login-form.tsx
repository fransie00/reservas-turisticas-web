"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Field, FormErrors, SubmitButton } from "./form-ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormErrors errors={state?.errors} />
      <Field
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        defaultValue={state?.values?.email}
        required
      />
      <Field
        id="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        required
      />
      <SubmitButton pending={pending}>Iniciar sesión</SubmitButton>
    </form>
  );
}
