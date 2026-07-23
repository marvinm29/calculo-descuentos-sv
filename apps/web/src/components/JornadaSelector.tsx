import type { JornadaConfig } from '@calc/shared';

export interface JornadaSelectorProps {
  value: JornadaConfig;
  onChange: (value: JornadaConfig) => void;
}

export function JornadaSelector({ value, onChange }: JornadaSelectorProps) {
  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-bold text-text mb-3">Jornada Laboral</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Tipo de jornada
          </label>
          <select
            value={value.tipo}
            onChange={(e) => {
              const tipo = e.target.value as JornadaConfig['tipo'];
              onChange({
                ...value,
                tipo,
                horasSemanales: tipo === 'tiempo_completo' ? 44 : value.horasSemanales,
              });
            }}
            className="glass-input block w-full rounded-xl px-3 py-2 text-sm"
          >
            <option value="tiempo_completo">Tiempo completo (44 h/sem)</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>

        {value.tipo === 'personalizado' && (
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Horas semanales
            </label>
            <input
              type="number"
              min={1}
              max={168}
              step={0.5}
              value={value.horasSemanales || ''}
              onChange={(e) => {
                const h = e.target.value === '' ? 0 : Number(e.target.value);
                onChange({ ...value, horasSemanales: h });
              }}
              className="glass-input block w-full rounded-xl px-3 py-2 text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Modalidad
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="radio"
                name="modalidad"
                value="diurna"
                checked={value.modalidad === 'diurna'}
                onChange={() => onChange({ ...value, modalidad: 'diurna' })}
                className="text-primary"
              />
              Diurna
            </label>
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="radio"
                name="modalidad"
                value="nocturna"
                checked={value.modalidad === 'nocturna'}
                onChange={() => onChange({ ...value, modalidad: 'nocturna' })}
                className="text-primary"
              />
              Nocturna
            </label>
          </div>
        </div>

        {value.tipo === 'personalizado' && value.horasSemanales > 0 && (
          <p className="text-xs text-warning">
            {value.horasSemanales > (value.modalidad === 'nocturna' ? 39 : 44)
              ? `El exceso sobre ${value.modalidad === 'nocturna' ? 39 : 44}h se pagará como hora extra.`
              : 'Jornada dentro del límite legal.'}
          </p>
        )}
      </div>
    </div>
  );
}
