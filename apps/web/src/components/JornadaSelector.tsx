import type { JornadaConfig } from '@calc/shared';

export interface JornadaSelectorProps {
  value: JornadaConfig;
  onChange: (value: JornadaConfig) => void;
}

export function JornadaSelector({ value, onChange }: JornadaSelectorProps) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-bold text-text mb-3">Jornada Laboral</h3>

      <fieldset>
        <legend className="text-xs font-medium text-text-secondary mb-1">
          Modalidad
        </legend>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="radio"
              name="modalidad"
              value="diurna"
              checked={value.modalidad === 'diurna'}
              onChange={() => onChange({ modalidad: 'diurna' })}
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
              onChange={() => onChange({ modalidad: 'nocturna' })}
              className="text-primary"
            />
            Nocturna
          </label>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Solo informativo: las horas extra nocturnas ya usan su factor de 2.25x.
        </p>
      </fieldset>
    </div>
  );
}