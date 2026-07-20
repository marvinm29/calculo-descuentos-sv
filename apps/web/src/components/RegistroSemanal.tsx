import { useState } from 'react';
import { useRegistroSemanal } from '../hooks/useRegistroSemanal';
import { FilaDia } from './FilaDia';
import { TotalesSemana } from './TotalesSemana';
import {
  lunesDesdeSemanaId,
  formatearFecha,
  crearDiaVacio,
} from './registroTypes';
import type { DiaRegistro } from './registroTypes';

type Vista = 'semanal' | 'diaria';

export function RegistroSemanal() {
  const { semanaId, dias, updateDia, setDias } = useRegistroSemanal();
  const [vista, setVista] = useState<Vista>('semanal');
  const [fechaDia, setFechaDia] = useState(() => formatearFecha(new Date()));

  const lunes = lunesDesdeSemanaId(semanaId);
  const domingo = new Date(lunes);
  domingo.setDate(domingo.getDate() + 6);

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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">
          Registro {vista === 'semanal' ? 'Semanal' : 'por Día'}
        </h2>
        <div className="flex items-center gap-2">
          {vista === 'semanal' && (
            <span className="text-sm text-text-muted">
              {formatearFecha(lunes)} — {formatearFecha(domingo)}
            </span>
          )}
          <button
            onClick={() => {
              setVista((v) => (v === 'semanal' ? 'diaria' : 'semanal'));
            }}
            type="button"
            className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium text-text-secondary hover:text-text focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {vista === 'semanal' ? 'Ver por día' : 'Ver semana'}
          </button>
        </div>
      </div>

      {vista === 'diaria' && (
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
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
      )}

      <div className="space-y-2">
        {vista === 'semanal' ? (
          dias.map((dia, index) => (
            <FilaDia
              key={dia.fecha}
              dia={dia}
              onChange={(updated) => {
                updateDia(index, updated);
              }}
            />
          ))
        ) : (
          <FilaDia
            key={fechaDia}
            dia={diaActual}
            onChange={handleDiaChange}
          />
        )}
      </div>

      {vista === 'semanal' && <TotalesSemana dias={dias} />}
    </section>
  );
}
