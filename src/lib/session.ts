import "server-only";
import { cookies } from "next/headers";
import type { RolNombre } from "./types";

export const SESSION_COOKIE = "session_token";

/**
 * Lee el contenido del JWT sin verificar la firma. No autoriza nada: solo sirve para
 * alinear la vida de la cookie y para redirigir por rol antes de renderizar.
 */
export function leerToken(token: string): { exp?: number; rol?: RolNombre } {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")) ?? {};
  } catch {
    return {};
  }
}

export async function createSession(token: string): Promise<void> {
  const { exp } = leerToken(token);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: exp ? new Date(exp * 1000) : undefined,
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
