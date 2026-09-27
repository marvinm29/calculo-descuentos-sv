import { useCallback, useEffect, useRef, useState } from 'react';
import type { CalculoState } from '@calc/shared';
import { historialPeriodosSchema, LIMITES_CONTRATO } from '@calc/shared';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { parseador } from '../lib/storage';

// La forma del historial se valida SIEMPRE contra historialPeriodosSchema
// (Regla 8 de integridad; FE-02). No se consume por cast directo.
export type PeriodoGuardado = typeof historialPeriodosSchema._output[number];

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
  // El parser corre durante el primer render (inicializador del hook), así
  // que el ref debe existir antes para capturar el descarte sin tocar estado
  // en fase de render; el aviso se publica tras el mount (FE-02/FE-16).
  const descartoCorrupto = useRef(false);
  const [avisoCorrupto, setAvisoCorrupto] = useState(false);
  const [periodos, setPeriodos] = useLocalStorage<PeriodoGuardado[]>(
    STORAGE_KEY,
    [],
    parseador(historialPeriodosSchema, [], STORAGE_KEY, () => {
      descartoCorrupto.current = true;
    }),
  );

  useEffect(() => {
    if (descartoCorrupto.current) setAvisoCorrupto(true);
  }, []);

  const guardar = useCallback(() => {
    if (calculoState.status !== 'success') return;

    const nuevo: PeriodoGuardado = {
      id: generateId(),
      fecha: new Date().toISOString(),
      neto: calculoState.data.neto.salarioLiquido,
      brutoTotal: calculoState.data.bruto.brutoTotal,
    };

    // FE-16: retención máxima documentada; el más antiguo se recorta (FIFO)
    // para no agotar la cuota de localStorage.
    setPeriodos((prev) =>
      [...prev, nuevo].slice(-LIMITES_CONTRATO.MAX_HISTORIAL),
    );
  }, [calculoState, setPeriodos]);

  const eliminar = useCallback(
    (id: string) => {
      setPeriodos((prev) => prev.filter((p) => p.id !== id));
    },
    [setPeriodos],
  );

  return (
    <div className="panel p-4">
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

      {avisoCorrupto && (
        <p role="alert" className="mt-2 text-xs text-danger">
          El historial guardado estaba corrupto y se restableció a vacío.
        </p>
      )}

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
                <span className="font-semibold text-success">
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
