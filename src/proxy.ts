import { NextResponse, type NextRequest } from "next/server";
import { DASHBOARD_POR_ROL } from "@/lib/roles";
import { leerToken, SESSION_COOKIE } from "@/lib/session";

/** Vistas que una cuenta de empresa nunca debe ver: inicio, catálogo y secciones de cliente. */
const vedadaParaEmpresa = (pathname: string): boolean =>
  pathname === "/" ||
  pathname === "/dashboard" ||
  ["/lugares", "/dashboard/cliente"].some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));

/**
 * Chequeo optimista: mira la cookie y el rol que declara el token, para redirigir antes
 * de renderizar nada. La validación real ocurre en `verifySession()` (src/lib/dal.ts) y en la API.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const tieneSesion = token !== undefined;
  const rol = token ? leerToken(token).rol : undefined;
  const { pathname } = request.nextUrl;

  const protegida = ["/perfil", "/dashboard", "/lugares"].some((ruta) => pathname.startsWith(ruta));
  if (protegida && !tieneSesion) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if ((pathname === "/login" || pathname === "/registro") && tieneSesion) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (rol === "empresa" && vedadaParaEmpresa(pathname)) {
    return NextResponse.redirect(new URL(DASHBOARD_POR_ROL.empresa, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/perfil/:path*", "/dashboard/:path*", "/lugares/:path*", "/login", "/registro"],
};
