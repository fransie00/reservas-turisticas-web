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

/** Lugar turístico como lo ve su empresa. */
export interface Lugar {
  id: number;
  nombre: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  capacidad: number;
  imagenes: { id: number; url: string }[];
}

/** Lugar turístico en el catálogo. */
export interface LugarPublico extends Lugar {
  empresa: { id: number; nombre_comercial: string };
}

export interface LugarCatalogo extends LugarPublico {
  /** `YYYY-MM-DD`, o null si no hay nada publicado. */
  proxima_fecha: string | null;
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
  /** Solo tiene valor si la reserva está cancelada. */
  motivo_cancelacion: string | null;
  servicio: { id: number; nombre: string };
  lugar: { id: number; nombre: string };
  empresa: { nombre_comercial: string; contacto: { email: string; telefono: string | null } | null };
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

export interface BloquesDelMes<T> {
  /** `YYYY-MM` */
  mes: string;
  bloques: T[];
}

export interface SalidasDia {
  /** 1 = lunes ... 7 = domingo */
  dia: number;
  horas: string[];
}

/** Patrón reutilizable: solo días y horas de salida. */
export interface Horario {
  id: number;
  nombre: string;
  salidas: SalidasDia[];
  servicios: { id: number; nombre: string }[];
  aplicaciones: { servicio: { id: number; nombre: string }; desde: string; hasta: string; cupos: number }[];
}

export interface PedidoAplicacion {
  servicio_id: number;
  desde: string;
  hasta: string;
  cupos: number;
}

export interface ResultadoServicio {
  servicio_id: number;
  error?: string;
  bloques: number;
  omitidos_existentes: number;
  omitidos_pasados: number;
  otras_salidas: number;
}

export interface ResumenServicio {
  id: number;
  nombre: string;
  lugar: { id: number; nombre: string; capacidad: number };
  duracion_minutos: number;
  horarios: { id: number; nombre: string }[];
  cupos: number | null;
  /** `YYYY-MM-DD` */
  hasta: string | null;
  proximos: number;
}

/** Qué pasaría al eliminar un horario. */
export interface Impacto {
  nombre: string;
  salidas_a_eliminar: number;
  salidas_a_anular: number;
  reservas: {
    id: number;
    estado: "pendiente" | "aceptada";
    fecha: string;
    hora_inicio: string;
    servicio: string;
    cantidad_personas: number;
    cliente: { nombre_completo: string; email: string; telefono: string | null };
  }[];
}
