import "server-only";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; messages: string[] };

/** Llama a la API de NestJS desde el servidor. El token nunca llega al JavaScript del navegador. */
export async function apiFetch<T>(
  path: string,
  options: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown; token?: string } = {},
): Promise<ApiResult<T>> {
  // Con FormData (subida de archivos) fetch pone el Content-Type con su boundary.
  const esFormData = options.body instanceof FormData;
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        ...(esFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: esFormData
        ? (options.body as FormData)
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
      cache: "no-store",
    });

    const json: unknown = await res.json().catch(() => null);

    if (res.ok) return { ok: true, status: res.status, data: json as T };

    const message = (json as { message?: string | string[] } | null)?.message;
    const messages = Array.isArray(message)
      ? message
      : [message ?? "Ocurrió un error inesperado"];
    return { ok: false, status: res.status, messages };
  } catch {
    return {
      ok: false,
      status: 0,
      messages: ["No se pudo conectar con el servidor. Inténtalo más tarde."],
    };
  }
}
