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

  function guardar() {
    if (calculoState.status !== 'success') return;
    const nuevo: PeriodoGuardado = {
      id: generateId(),
      fecha: new Date().toISOString(),
      neto: calculoState.data.neto.salarioLiquido,
      brutoTotal: calculoState.data.bruto.brutoTotal,
    };
    setPeriodos((prev) => [...prev, nuevo]);
  }

  function eliminar(id: string) {
    setPeriodos((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          Historial de Periodos
        </h3>
        <button
          onClick={guardar}
          className="rounded bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-light focus:ring-2 focus:ring-primary focus:outline-none"
        >
          Guardar periodo actual
        </button>
      </div>

      {periodos.length === 0 && (
        <p className="mt-2 text-xs text-gray-400">
          No hay periodos guardados.
        </p>
      )}

      {periodos.length > 0 && (
        <ul className="mt-2 divide-y divide-gray-100">
          {periodos.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between py-2"
            >
              <div className="text-xs text-gray-600">
                <span className="font-medium">
                  ${p.neto.toFixed(2)}
                </span>
                <span className="ml-2 text-gray-400">
                  Bruto: ${p.brutoTotal.toFixed(2)}
                </span>
                <span className="ml-2 text-gray-400">
                  {new Date(p.fecha).toLocaleDateString('es-SV')}
                </span>
              </div>
              <button
                onClick={() => {
                  eliminar(p.id);
                }}
                className="text-xs text-red-500 hover:text-red-700 focus:underline focus:outline-none"
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
