export type RolNombre = "admin" | "empresa" | "cliente";

export interface Usuario {
  id: number;
  rut: string;
  nombre_completo: string;
  email: string;
  rol: RolNombre;
  activo: boolean;
}

export interface AuthResponse {
  access_token: string;
  usuario: Usuario;
}

/** Vista pública de una empresa (la que ve el cliente). */
export interface EmpresaPublica {
  id: number;
  nombre_comercial: string;
  descripcion: string | null;
  categoria: string;
  direccion: string | null;
  ciudad: string;
}

/** Vista de la propia empresa. */
export interface EmpresaPrivada extends EmpresaPublica {
  rut: string;
  verificada: boolean;
}

/** Vista del administrador. */
export interface EmpresaAdmin extends EmpresaPrivada {
  usuario: { id: number; nombre_completo: string; email: string; activo: boolean };
}
