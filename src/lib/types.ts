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
