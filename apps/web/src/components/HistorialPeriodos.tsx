import { useCallback } from 'react';
import type { CalculoState } from '@calc/shared';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface PeriodoGuardado {
  id: string;
  fecha: string;
  neto: number;
  brutoTotal: number;
}

const STORAGE_KEY = 'historial-periodos';

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `periodo-${Date.now()}-${idCounter}`;
}

export interface HistorialPeriodosProps {
  calculoState: CalculoState;
}

export function HistorialPeriodos({ calculoState }: HistorialPeriodosProps) {
  const [periodos, setPeriodos] = useLocalStorage<PeriodoGuardado[]>(
    STORAGE_KEY,
    [],
  );

  const guardar = useCallback(() => {
    if (calculoState.status !== 'success') return;

    const nuevo: PeriodoGuardado = {
      id: generateId(),
      fecha: new Date().toISOString(),
      neto: calculoState.data.neto.salarioLiquido,
      brutoTotal: calculoState.data.bruto.brutoTotal,
    };

    setPeriodos((prev) => [...prev, nuevo]);
  }, [calculoState, setPeriodos]);

  const eliminar = useCallback(
    (id: string) => {
      setPeriodos((prev) => prev.filter((p) => p.id !== id));
    },
    [setPeriodos],
  );

  return (
    <div className="tool-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text">
          Historial de Periodos
        </h3>
        <button
          onClick={guardar}
          className="btn-accent px-3 py-1.5 text-xs"
        >
          Guardar periodo actual
        </button>
      </div>

      {periodos.length === 0 && (
        <p className="mt-2 text-xs text-text-muted">
          No hay periodos guardados.
        </p>
      )}

      {periodos.length > 0 && (
        <ul className="mt-3 divide-y divide-border">
          {periodos.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between py-2"
            >
              <div className="text-xs text-text-secondary">
                <span className="font-semibold text-glow-success">
                  ${p.neto.toFixed(2)}
                </span>
                <span className="ml-2 text-text-muted">
                  Bruto: ${p.brutoTotal.toFixed(2)}
                </span>
                <span className="ml-2 text-text-muted">
                  {new Date(p.fecha).toLocaleDateString('es-SV')}
                </span>
              </div>
              <button
                onClick={() => eliminar(p.id)}
                className="text-xs text-danger hover:text-danger focus:underline focus:outline-none"
                aria-label={`Eliminar periodo de ${new Date(p.fecha).toLocaleDateString('es-SV')}`}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}