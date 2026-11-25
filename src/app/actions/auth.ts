"use server";

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { createSession, deleteSession } from "@/lib/session";
import type { AuthResponse } from "@/lib/types";

export interface FormState {
  errors?: string[];
  values?: Record<string, string>;
}

const texto = (formData: FormData, campo: string): string =>
  String(formData.get(campo) ?? "").trim();

export async function login(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const email = texto(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { errors: ["Ingresa tu email y contraseña"], values: { email } };
  }

  const res = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (!res.ok) return { errors: res.messages, values: { email } };

  await createSession(res.data.access_token);
  redirect("/dashboard");
}

export async function register(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const values = {
    nombre_completo: texto(formData, "nombre_completo"),
    rut: texto(formData, "rut"),
    email: texto(formData, "email"),
    telefono: texto(formData, "telefono"),
    rol: texto(formData, "rol") || "cliente",
  };
  const password = String(formData.get("password") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");

  if (password !== confirmar) {
    return { errors: ["Las contraseñas no coinciden"], values };
  }

  const res = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: {
      ...values,
      telefono: values.telefono || undefined,
      password,
    },
  });
  if (!res.ok) return { errors: res.messages, values };

  await createSession(res.data.access_token);
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
