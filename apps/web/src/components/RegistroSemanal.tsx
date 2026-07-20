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
        <h2 className="text-lg font-bold text-text">
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
            className="glass-card rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text"
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
            className="glass-input mt-1 block w-full rounded-xl px-3 py-2 text-sm"
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
