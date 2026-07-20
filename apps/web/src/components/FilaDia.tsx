import type { DiaRegistro } from './registroTypes';
import { nombreDia } from './registroTypes';

export interface FilaDiaProps {
  dia: DiaRegistro;
  onChange: (dia: DiaRegistro) => void;
}

export function FilaDia({ dia, onChange }: FilaDiaProps) {
  const fecha = new Date(dia.fecha + 'T00:00:00');
  const nombre = nombreDia(fecha);

  function update<K extends keyof DiaRegistro>(field: K, value: DiaRegistro[K]) {
    onChange({ ...dia, [field]: value });
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="w-10 text-sm font-medium text-text">{nombre}</span>
        <span className="text-xs text-text-muted">{dia.fecha}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div>
          <label className="block text-xs text-text-secondary">Jornada base</label>
          <select
            value={dia.jornadaBase}
            onChange={(e) => {
              update('jornadaBase', e.target.value as DiaRegistro['jornadaBase']);
            }}
            className="w-full rounded border border-border bg-surface px-2 py-1 text-xs text-text"
            aria-label={`Tipo de jornada para ${nombre}`}
          >
            <option value="regular_diurna">Diurna</option>
            <option value="regular_nocturna">Nocturna</option>
            <option value="descanso">Descanso</option>
            <option value="asueto">Asueto</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-text-secondary">Horas base</label>
          <input
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={dia.horasBase || ''}
            onChange={(e) => {
              update('horasBase', Number(e.target.value));
            }}
            className="w-full rounded border border-border bg-surface px-2 py-1 text-xs text-text"
            aria-label={`Horas base para ${nombre}`}
          />
        </div>

        <div>
          <label className="block text-xs text-text-secondary">Extra diurna</label>
          <input
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={dia.horasExtraDiurna || ''}
            onChange={(e) => {
              update('horasExtraDiurna', Number(e.target.value));
            }}
            className="w-full rounded border border-border bg-surface px-2 py-1 text-xs text-text"
            aria-label={`Horas extra diurna para ${nombre}`}
          />
        </div>

        <div>
          <label className="block text-xs text-text-secondary">Extra nocturna</label>
          <input
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={dia.horasExtraNocturna || ''}
            onChange={(e) => {
              update('horasExtraNocturna', Number(e.target.value));
            }}
            className="w-full rounded border border-border bg-surface px-2 py-1 text-xs text-text"
            aria-label={`Horas extra nocturna para ${nombre}`}
          />
        </div>

        {dia.jornadaBase === 'descanso' && (
          <>
            <div>
              <label className="block text-xs text-text-secondary">
                Día libre diurna
              </label>
              <input
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={dia.horasDiaLibreDiurna || ''}
                onChange={(e) => {
                  update('horasDiaLibreDiurna', Number(e.target.value));
                }}
                className="w-full rounded border border-border bg-surface px-2 py-1 text-xs text-text"
                aria-label={`Horas día libre diurna para ${nombre}`}
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary">
                Día libre nocturna
              </label>
              <input
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={dia.horasDiaLibreNocturna || ''}
                onChange={(e) => {
                  update('horasDiaLibreNocturna', Number(e.target.value));
                }}
                className="w-full rounded border border-border bg-surface px-2 py-1 text-xs text-text"
                aria-label={`Horas día libre nocturna para ${nombre}`}
              />
            </div>
          </>
        )}

        {dia.jornadaBase === 'asueto' && (
          <div>
            <label className="block text-xs text-text-secondary">
              Horas en asueto
            </label>
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={dia.horasAsueto || ''}
              onChange={(e) => {
                update('horasAsueto', Number(e.target.value));
              }}
              className="w-full rounded border border-border bg-surface px-2 py-1 text-xs text-text"
              aria-label={`Horas en asueto para ${nombre}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
