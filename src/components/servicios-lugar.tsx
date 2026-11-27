import { formatoDuracion, textoValorReferencial } from "@/lib/formato";
import { agruparSalidas, nombrarDias } from "@/lib/horarios";
import type { LugarDetalle, ServicioPublico } from "@/lib/types";

/**
 * Cada servicio activo con su propia descripción y tarifa.
 * `detallado` añade duración y horario: la tarjeta del catálogo no los muestra.
 */
export function ServiciosLugar({ servicios, detallado = false }: { servicios: ServicioPublico[]; detallado?: boolean }) {
  if (servicios.length === 0) {
    return <p className="text-sm text-cafe-500">Este lugar no tiene servicios disponibles por ahora.</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {servicios.map((s) => (
        <li key={s.id} className="rounded-lg border border-cafe-200 p-4 dark:border-cafe-800">
          <h3 className="font-semibold">{s.nombre}</h3>
          {detallado && <p className="text-sm text-cafe-500">{formatoDuracion(s.duracion_minutos)}</p>}
          <p className="mt-2 whitespace-pre-line text-sm">{s.descripcion}</p>
          <p className="mt-2 text-sm font-semibold text-accent">{textoValorReferencial(s.precio)}</p>
          {detallado && (
            <p className="mt-1 text-sm text-cafe-600 dark:text-cafe-300">
              Horario:{" "}
              {s.horario.length === 0
                ? "sin salidas publicadas"
                : agruparSalidas(s.horario)
                    .map((g) => `${nombrarDias(g.dias)}: ${g.horas.join(", ")}`)
                    .join(" · ")}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

export function Contacto({ contacto: { telefono, email } }: { contacto: LugarDetalle["empresa"]["contacto"] }) {
  return (
    <ul>
      <li>
        {telefono ? (
          <a href={`tel:${telefono.replace(/\s/g, "")}`} className="hover:underline">{telefono}</a>
        ) : (
          <span className="text-cafe-500">Teléfono no informado</span>
        )}
      </li>
      <li>
        <a href={`mailto:${email}`} className="break-all hover:underline">{email}</a>
      </li>
    </ul>
  );
}
