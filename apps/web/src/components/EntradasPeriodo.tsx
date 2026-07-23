import type { EntradaPeriodo, TipoEntrada } from '@calc/shared';

export interface EntradasPeriodoProps {
  entradas: EntradaPeriodo[];
  onChange: (entradas: EntradaPeriodo[]) => void;
}

const TIPOS: { value: TipoEntrada; label: string; factor: string }[] = [
  { value: 'extra', label: 'Horas extra regulares', factor: '2.00x / 2.25x' },
  { value: 'dia_libre', label: 'Día libre trabajado', factor: '1.50x / 1.75x' },
  { value: 'asueto', label: 'Asueto trabajado', factor: '2.00x' },
];

let idCounter = 0;
function generarId(): string {
  idCounter += 1;
  return `ent-${Date.now()}-${idCounter}`;
}

function entradaVacia(): EntradaPeriodo {
  return {
    id: generarId(),
    fecha: new Date().toISOString().slice(0, 10),
    tipo: 'extra',
    horasDiurnas: 0,
    horasNocturnas: 0,
  };
}

export function EntradasPeriodo({ entradas, onChange }: EntradasPeriodoProps) {
  function update(index: number, partial: Partial<EntradaPeriodo>) {
    const nuevas = entradas.map((e, i) =>
      i === index ? { ...e, ...partial } : e,
    );
    onChange(nuevas);
  }

  function eliminar(index: number) {
    onChange(entradas.filter((_, i) => i !== index));
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text">Horas del Periodo</h3>
        <button
          type="button"
          onClick={() => onChange([...entradas, entradaVacia()])}
          className="btn-accent rounded-lg px-2.5 py-1 text-xs"
        >
          Agregar entrada
        </button>
      </div>

      {entradas.length === 0 && (
        <p className="text-xs text-text-muted">
          No hay entradas registradas. Agregá una para empezar.
        </p>
      )}

      <div className="space-y-2">
        {entradas.map((e, i) => (
          <div
            key={e.id}
            className="glass-card rounded-lg p-3 flex flex-wrap items-end gap-2"
          >
            <div className="w-36">
              <label className="block text-[10px] font-medium text-text-secondary mb-0.5">
                Fecha
              </label>
              <input
                type="date"
                value={e.fecha}
                onChange={(ev) => update(i, { fecha: ev.target.value })}
                className="glass-input block w-full rounded-lg px-2 py-1.5 text-xs"
              />
            </div>

            <div className="w-28">
              <label className="block text-[10px] font-medium text-text-secondary mb-0.5">
                Horas diurnas
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={e.horasDiurnas || ''}
                onChange={(ev) =>
                  update(i, { horasDiurnas: ev.target.value === '' ? 0 : Number(ev.target.value) })
                }
                className="glass-input block w-full rounded-lg px-2 py-1.5 text-xs"
              />
            </div>

            <div className="w-28">
              <label className="block text-[10px] font-medium text-text-secondary mb-0.5">
                Horas nocturnas
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={e.horasNocturnas || ''}
                onChange={(ev) =>
                  update(i, { horasNocturnas: ev.target.value === '' ? 0 : Number(ev.target.value) })
                }
                className="glass-input block w-full rounded-lg px-2 py-1.5 text-xs"
              />
            </div>

            <div className="w-40">
              <label className="block text-[10px] font-medium text-text-secondary mb-0.5">
                Tipo
              </label>
              <select
                value={e.tipo}
                onChange={(ev) => update(i, { tipo: ev.target.value as TipoEntrada })}
                className="glass-input block w-full rounded-lg px-2 py-1.5 text-xs"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

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

      {entradas.length > 0 && (
        <p className="mt-2 text-[10px] text-text-muted text-right">
          {TIPOS.find((t) => t.value === entradas[entradas.length - 1]?.tipo)?.factor && (
            <>Factor: {TIPOS.find((t) => t.value === entradas[entradas.length - 1]?.tipo)!.factor}</>
          )}
        </p>
      )}
    </div>
  );
}
