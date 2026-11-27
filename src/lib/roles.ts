import type { RolNombre } from "./types";

/** Ruta del dashboard que le corresponde a cada rol. */
export const DASHBOARD_POR_ROL: Record<RolNombre, string> = {
  cliente: "/lugares",
  empresa: "/dashboard/empresa",
  admin: "/dashboard/admin",
};

export const ETIQUETA_ROL: Record<RolNombre, string> = {
  cliente: "Cliente",
  empresa: "Empresa",
  admin: "Administrador",
};
