import type { Incentivo } from '@calc/shared';

export interface IncentivosFormProps {
  incentivos: Incentivo[];
  onChange: (incentivos: Incentivo[]) => void;
}

let idCounter = 0;
function generarId(): string {
  idCounter += 1;
  return `inc-${Date.now()}-${idCounter}`;
}

function crearVacio(): Incentivo {
  return { id: generarId(), concepto: '', monto: 0, aplicaDescuentos: true };
}

export function IncentivosForm({ incentivos, onChange }: IncentivosFormProps) {
  function update(index: number, partial: Partial<Incentivo>) {
    const nuevos = incentivos.map((inc, i) =>
      i === index ? { ...inc, ...partial } : inc,
    );
    onChange(nuevos);
  }

  function eliminar(index: number) {
    onChange(incentivos.filter((_, i) => i !== index));
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text">
          Incentivos (bonos, comisiones, etc.)
        </h3>
        <button
          type="button"
          onClick={() => onChange([...incentivos, crearVacio()])}
          className="btn-accent rounded-lg px-2.5 py-1 text-xs"
        >
          Agregar
        </button>
      </div>

      {incentivos.length === 0 && (
        <p className="text-xs text-text-muted">
          No hay incentivos registrados.
        </p>
      )}

      <div className="space-y-2">
        {incentivos.map((inc, i) => (
          <div
            key={inc.id}
            className="glass-card rounded-lg p-3 flex flex-wrap items-end gap-2"
          >
            <div className="flex-1 min-w-[120px]">
              <label className="block text-[10px] font-medium text-text-secondary mb-0.5">
                Concepto
              </label>
              <input
                type="text"
                value={inc.concepto}
                onChange={(e) => update(i, { concepto: e.target.value })}
                placeholder="Bono, comisión..."
                className="glass-input block w-full rounded-lg px-2 py-1.5 text-xs"
              />
            </div>

            <div className="w-24">
              <label className="block text-[10px] font-medium text-text-secondary mb-0.5">
                Monto (USD)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={inc.monto || ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? 0 : Number(e.target.value);
                  update(i, { monto: v });
                }}
                className="glass-input block w-full rounded-lg px-2 py-1.5 text-xs"
              />
            </div>

            <label className="flex items-center gap-1.5 text-[10px] text-text-secondary cursor-pointer pb-0.5">
              <input
                type="checkbox"
                checked={inc.aplicaDescuentos}
                onChange={(e) => update(i, { aplicaDescuentos: e.target.checked })}
                className="text-primary"
              />
              Aplica descuentos de ley
            </label>

            <button
              type="button"
              onClick={() => eliminar(i)}
              className="text-xs text-danger hover:text-danger pb-0.5"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
