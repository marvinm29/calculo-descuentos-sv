import type { Incentivo } from '@calc/shared';
import { LIMITES_CONTRATO } from '@calc/shared';

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

// FE-04: la fila parcialmente llena (monto > 0 y concepto en blanco o solo
// espacios) es inválida: muestra error inline y no debe enviarse al cálculo
// (ver captura-horas.md § Incentivos en la UI). La fila totalmente vacía y la
// fila en curso de llenado (concepto sin monto) no se marcan: no penalizar
// estados intermedios de escritura.
// Regla 4 en cliente (2026-09-20): NaN, ±Infinity, negativos y fuera de rango
// (concepto > 100 caracteres) se detectan aquí, en el mismo evento de edición
// (captura-horas.md § Validación numérica en la UI).
export function validarIncentivo(inc: Incentivo): string | null {
  if (!Number.isFinite(inc.monto)) {
    return 'El monto debe ser un número finito';
  }
  if (inc.monto < 0) {
    return 'El monto no puede ser negativo';
  }
  if (inc.concepto.trim().length > LIMITES_CONTRATO.MAX_CONCEPTO) {
    return `El concepto no puede exceder ${LIMITES_CONTRATO.MAX_CONCEPTO} caracteres`;
  }
  if (inc.monto > 0 && inc.concepto.trim() === '') {
    return 'Indicá el concepto del incentivo o dejá el monto en 0';
  }
  return null;
}

export function IncentivosForm({ incentivos, onChange }: IncentivosFormProps) {
  const limiteAlcanzado = incentivos.length >= LIMITES_CONTRATO.MAX_INCENTIVOS;

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
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text">
          Incentivos (bonos, comisiones, etc.)
        </h3>
        <button
          type="button"
          onClick={() => onChange([...incentivos, crearVacio()])}
          disabled={limiteAlcanzado}
          title={
            limiteAlcanzado
              ? `Máximo ${LIMITES_CONTRATO.MAX_INCENTIVOS} incentivos`
              : undefined
          }
          className="btn-accent px-2.5 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          Agregar
        </button>
      </div>

      {incentivos.length === 0 && (
        <p className="text-xs text-text-muted">
          No hay incentivos registrados.
        </p>
      )}

      {limiteAlcanzado && (
        <p className="mb-2 text-[10px] text-danger" role="alert">
          Máximo {LIMITES_CONTRATO.MAX_INCENTIVOS} incentivos.
        </p>
      )}

      <div className="space-y-2">
        {incentivos.map((inc, i) => {
          const error = validarIncentivo(inc);
          const errorId = `incentivo-error-${inc.id}`;
          return (
          <div
            key={inc.id}
            className="tool-card rounded-md p-3 flex flex-wrap items-end gap-2"
          >
            <div className="flex-1 min-w-[120px]">
              <label
                htmlFor={`concepto-${inc.id}`}
                className="block text-[10px] font-medium text-text-secondary mb-0.5"
              >
                Concepto
              </label>
              <input
                id={`concepto-${inc.id}`}
                type="text"
                value={inc.concepto}
                onChange={(e) => update(i, { concepto: e.target.value })}
                placeholder="Bono, comisión..."
                aria-invalid={error !== null}
                aria-describedby={error ? errorId : undefined}
                className="tool-input block w-full rounded-md px-2 py-1.5 text-xs"
              />
            </div>

            <div className="w-24">
              <label
                htmlFor={`monto-${inc.id}`}
                className="block text-[10px] font-medium text-text-secondary mb-0.5"
              >
                Monto (USD)
              </label>
              <input
                id={`monto-${inc.id}`}
                type="number"
                min={0}
                step="0.01"
                value={inc.monto || ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? 0 : Number(e.target.value);
                  update(i, { monto: v });
                }}
                aria-invalid={error !== null}
                aria-describedby={error ? errorId : undefined}
                className="tool-input block w-full rounded-md px-2 py-1.5 text-xs"
              />
            </div>

            <label
              htmlFor={`descuentos-${inc.id}`}
              className="flex items-center gap-1.5 text-[10px] text-text-secondary cursor-pointer pb-0.5"
            >
              <input
                id={`descuentos-${inc.id}`}
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

            {error && (
              <p
                id={errorId}
                className="w-full text-[10px] font-medium text-danger"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}
