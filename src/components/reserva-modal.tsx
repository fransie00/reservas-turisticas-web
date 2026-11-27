"use client";

import { useRef, useState, useTransition } from "react";
import { cargarReserva, type DatosReserva } from "@/app/actions/reservas";
import { ReservaForm } from "./reserva-form";

/** Botón "Reservar" con su ventana. `<dialog>` aporta el foco atrapado y el cierre con Escape. */
export function ReservaModal({ lugarId, className }: { lugarId: number; className: string }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState<DatosReserva>();
  const [cargando, startTransition] = useTransition();

  function abrir() {
    setAbierto(true);
    setDatos(undefined);
    dialogo.current?.showModal();
    startTransition(async () => {
      const res = await cargarReserva(lugarId).catch(
        (): DatosReserva => ({ ok: false, error: "No se pudo conectar con el servidor." }),
      );
      setDatos(res);
    });
  }

  const cerrar = () => dialogo.current?.close();

  return (
    <>
      <button type="button" onClick={abrir} className={className}>Reservar</button>
      <dialog
        ref={dialogo}
        aria-label="Reservar"
        onClose={() => setAbierto(false)}
        onClick={(e) => e.target === e.currentTarget && cerrar()}
        className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl bg-background text-foreground shadow-xl backdrop:bg-cafe-950/60"
      >
        {abierto && (
          <div className="p-6">
            <div className="flex justify-end">
              <button type="button" aria-label="Cerrar" onClick={cerrar} className="-mr-2 -mt-2 px-2 text-xl text-cafe-500">×</button>
            </div>
            {cargando || !datos ? (
              <p role="status" className="text-cafe-500">Cargando…</p>
            ) : !datos.ok ? (
              <p role="alert" className="text-sm text-red-700 dark:text-red-300">No se pudo cargar la disponibilidad: {datos.error}</p>
            ) : (
              <Contenido datos={datos} onCerrar={cerrar} />
            )}
          </div>
        )}
      </dialog>
    </>
  );
}

function Contenido({ datos, onCerrar }: { datos: Extract<DatosReserva, { ok: true }>; onCerrar: () => void }) {
  const { lugar, disponibilidad, hoy } = datos;
  const { servicios } = lugar;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-semibold">{lugar.nombre}</h2>
        <p className="text-sm text-cafe-500">{lugar.direccion}, {lugar.ciudad}</p>
      </div>
      {servicios.length === 0 ? (
        <p className="text-cafe-500">Este lugar no tiene servicios disponibles para reservar.</p>
      ) : (
        <ReservaForm
          lugarId={lugar.id}
          hoy={hoy}
          direccion={`${lugar.direccion}, ${lugar.ciudad}`}
          servicios={servicios}
          disponibilidad={disponibilidad}
          onCerrar={onCerrar}
        />
      )}
    </div>
  );
}
