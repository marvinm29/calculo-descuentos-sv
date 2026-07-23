import type { SemanaRegistro } from '@calc/shared';

export interface SemanaExtrasCardProps {
  index: number;
  value: SemanaRegistro;
  onChange: (value: SemanaRegistro) => void;
  onRemove?: () => void;
  canRemove: boolean;
}

const INPUTS: { key: keyof SemanaRegistro; label: string }[] = [
  { key: 'horasBaseNocturnas', label: 'Horas base nocturnas' },
  { key: 'extraDiurna', label: 'Extra diurna (2.00x)' },
  { key: 'extraNocturna', label: 'Extra nocturna (2.25x)' },
  { key: 'diaLibreDiurna', label: 'Día libre diurna (1.50x)' },
  { key: 'diaLibreNocturna', label: 'Día libre nocturna (1.75x)' },
  { key: 'asueto', label: 'Asueto (2.00x)' },
];

export function SemanaExtrasCard({
  index,
  value,
  onChange,
  onRemove,
  canRemove,
}: SemanaExtrasCardProps) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-text">Semana {index + 1}</h4>
        {canRemove && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-danger hover:text-danger"
          >
            Eliminar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {INPUTS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-[10px] font-medium text-text-secondary mb-0.5">
              {label}
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={value[key] || ''}
              onChange={(e) => {
                const v = e.target.value === '' ? 0 : Number(e.target.value);
                onChange({ ...value, [key]: v });
              }}
              className="glass-input block w-full rounded-lg px-2 py-1.5 text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
