import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Chequeo optimista: solo mira si existe la cookie. La validación real del token
 * ocurre en `verifySession()` (src/lib/dal.ts), cerca de los datos.
 */
export function proxy(request: NextRequest) {
  const tieneSesion = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  const protegida = ["/perfil", "/dashboard", "/lugares"].some((ruta) => pathname.startsWith(ruta));
  if (protegida && !tieneSesion) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if ((pathname === "/login" || pathname === "/registro") && tieneSesion) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/perfil/:path*", "/dashboard/:path*", "/lugares/:path*", "/login", "/registro"],
};
