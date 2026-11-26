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

export interface Horario {
  /** 1 = lunes ... 7 = domingo */
  dia: number;
  apertura: string;
  cierre: string;
}

/** Lugar turístico como lo ve su empresa. */
export interface Lugar {
  id: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  capacidad: number;
  horarios: Horario[];
  imagenes: { id: number; url: string }[];
}

/** Lugar turístico en el catálogo. */
export interface LugarPublico extends Lugar {
  empresa: { id: number; nombre_comercial: string };
}

export type EstadoServicio = "disponible" | "pausado" | "cancelado";

interface ServicioBase {
  id: number;
  nombre: string;
  descripcion: string;
  duracion_minutos: number;
  /** Pesos chilenos */
  precio: number;
  estado: EstadoServicio;
}

/** Servicio como lo ve su empresa. */
export interface Servicio extends ServicioBase {
  lugar: { id: number; nombre: string; activo: boolean };
}

/** Servicio como lo ve el cliente. */
export interface ServicioPublico extends ServicioBase {
  reservable: boolean;
}

export interface LugarDetalle extends LugarPublico {
  servicios: ServicioPublico[];
}

/** Vista del administrador. */
export interface EmpresaAdmin extends EmpresaPrivada {
  usuario: { id: number; nombre_completo: string; email: string; activo: boolean };
}

export type EstadoReserva = "pendiente" | "aceptada" | "rechazada" | "cancelada";

/** Reserva como la ve el cliente que la solicitó. */
export interface Reserva {
  id: number;
  estado: EstadoReserva;
  /** `YYYY-MM-DD` */
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  cantidad_personas: number;
  fecha_solicitud: string;
  /** Solo tiene valor si la reserva está rechazada. */
  motivo_rechazo: string | null;
  servicio: { id: number; nombre: string };
  lugar: { id: number; nombre: string };
  empresa: { nombre_comercial: string };
}

export type EstadoBloque = "disponible" | "completo" | "cerrado";

interface BloqueBase {
  id: number;
  /** `YYYY-MM-DD` */
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  cupos_disponibles: number;
}

/** Bloque reservable, como lo ve el cliente. */
export interface BloqueDisponible extends BloqueBase {
  servicio_id: number;
}

/** Bloque como lo ve la empresa que lo publicó. */
export interface Bloque extends BloqueBase {
  cupos_totales: number;
  estado: EstadoBloque;
  servicio: { id: number; nombre: string };
  lugar: { id: number; nombre: string };
}
