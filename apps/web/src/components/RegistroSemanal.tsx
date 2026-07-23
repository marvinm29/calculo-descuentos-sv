import { useState } from 'react';
import { useRegistroSemanal } from '../hooks/useRegistroSemanal';
import { FilaDia } from './FilaDia';
import { ResumenSemanalVisual } from './ResumenSemanalVisual';
import { formatearFecha, crearDiaVacio } from './registroTypes';
import type { DiaRegistro } from './registroTypes';

export function RegistroSemanal() {
  const {
    dias,
    lunes,
    domingo,
    updateDia,
    setDias,
    semanaAnterior,
    semanaSiguiente,
  } = useRegistroSemanal();

  const [fechaDia, setFechaDia] = useState(() => formatearFecha(new Date()));

  const diaActual: DiaRegistro =
    dias.find((d) => d.fecha === fechaDia) ?? crearDiaVacio(fechaDia);
  const diaIndex = dias.findIndex((d) => d.fecha === fechaDia);

  function handleDiaChange(updated: DiaRegistro) {
    if (diaIndex >= 0) {
      updateDia(diaIndex, updated);
    } else {
      setDias([...dias, updated]);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-text">
        Registro de Horas
      </h2>

      {/* Date picker */}
      <div>
        <label
          htmlFor="fecha-dia"
          className="block text-xs font-medium text-text-secondary"
        >
          Seleccionar fecha
        </label>
        <input
          id="fecha-dia"
          type="date"
          value={fechaDia}
          onChange={(e) => {
            setFechaDia(e.target.value);
          }}
          className="glass-input mt-1 block w-full rounded-xl px-3 py-2 text-sm"
        />
      </div>

      {/* Single day input */}
      <FilaDia
        key={fechaDia}
        dia={diaActual}
        onChange={handleDiaChange}
      />

      {/* Visual weekly summary */}
      <ResumenSemanalVisual
        dias={dias}
        lunes={lunes}
        domingo={domingo}
        onSemanaAnterior={semanaAnterior}
        onSemanaSiguiente={semanaSiguiente}
      />
    </section>
  );
}
