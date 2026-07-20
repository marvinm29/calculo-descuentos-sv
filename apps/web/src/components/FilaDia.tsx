import type { DiaRegistro } from './registroTypes';
import { nombreDia } from './registroTypes';

export interface FilaDiaProps {
  dia: DiaRegistro;
  onChange: (dia: DiaRegistro) => void;
}

export function FilaDia({ dia, onChange }: FilaDiaProps) {
  const fecha = new Date(dia.fecha + 'T00:00:00');
  const nombre = nombreDia(fecha);

  const jornadaLabel: Record<DiaRegistro['jornadaBase'], string> = {
    regular_diurna: 'Diurna',
    regular_nocturna: 'Nocturna',
    descanso: 'Descanso',
    asueto: 'Asueto',
  };

  function update<K extends keyof DiaRegistro>(field: K, value: DiaRegistro[K]) {
    onChange({ ...dia, [field]: value });
  }

  return (
    <div className="glass-card space-y-2 rounded-xl p-3">
      <div className="flex items-center gap-2">
        <span className="w-10 text-sm font-semibold text-text">{nombre}</span>
        <span className="text-xs text-text-muted">{dia.fecha}</span>
        <span className="ml-auto text-xs font-medium text-primary">
          {jornadaLabel[dia.jornadaBase]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium text-text-secondary">Jornada</label>
          <select
            value={dia.jornadaBase}
            onChange={(e) => {
              update('jornadaBase', e.target.value as DiaRegistro['jornadaBase']);
            }}
            className="glass-input mt-0.5 w-full rounded-lg px-2 py-1 text-xs"
            aria-label={`Tipo de jornada para ${nombre}`}
          >
            <option value="regular_diurna">Diurna</option>
            <option value="regular_nocturna">Nocturna</option>
            <option value="descanso">Descanso</option>
            <option value="asueto">Asueto</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary">
            Horas diurnas
          </label>
          <input
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={dia.horasDiurnas || ''}
            onChange={(e) => {
              update('horasDiurnas', Number(e.target.value));
            }}
            className="glass-input mt-0.5 w-full rounded-lg px-2 py-1 text-xs"
            aria-label={`Horas diurnas para ${nombre}`}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary">
            Horas nocturnas
          </label>
          <input
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={dia.horasNocturnas || ''}
            onChange={(e) => {
              update('horasNocturnas', Number(e.target.value));
            }}
            className="glass-input mt-0.5 w-full rounded-lg px-2 py-1 text-xs"
            aria-label={`Horas nocturnas para ${nombre}`}
          />
        </div>
      </div>
    </div>
  );
}
