import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/react';
import type { CalculoState, CalcularRequest, CalcularResponse } from '@calc/shared';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getApiUrl } from '../lib/api';

interface PeriodoGuardado {
  id: string;
  fecha: string;
  neto: number;
  brutoTotal: number;
}

interface HistoryRow {
  id: string;
  request_data: string;
  response_data: string;
  created_at: string;
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
  const { isSignedIn, getToken } = useAuth();
  const [periodos, setPeriodos] = useLocalStorage<PeriodoGuardado[]>(
    STORAGE_KEY,
    [],
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;

    let cancelled = false;
    setLoading(true);

    async function fetchHistory() {
      try {
        const token = await getToken();
        const res = await fetch(`${getApiUrl()}/api/history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) return;
        const data = (await res.json()) as HistoryRow[];
        if (cancelled) return;

        const mapped: PeriodoGuardado[] = data.map((row) => {
          const response = JSON.parse(row.response_data) as CalcularResponse;
          return {
            id: row.id,
            fecha: row.created_at,
            neto: response.neto.salarioLiquido,
            brutoTotal: response.bruto.brutoTotal,
          };
        });
        setPeriodos(mapped);
      } catch {
        // Silently fail — app works offline
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken, setPeriodos]);

  const guardar = useCallback(async () => {
    if (calculoState.status !== 'success') return;

    const nuevo: PeriodoGuardado = {
      id: generateId(),
      fecha: new Date().toISOString(),
      neto: calculoState.data.neto.salarioLiquido,
      brutoTotal: calculoState.data.bruto.brutoTotal,
    };

    if (isSignedIn) {
      try {
        const token = await getToken();
        const request: CalcularRequest = {
          salarioBase: 800,
          tipoPago: 'mensual',
          fechaInicio: new Date().toISOString().slice(0, 10),
          fechaFin: new Date().toISOString().slice(0, 10),
          antiguedad: '1_a_3',
          fechaIngreso: new Date().toISOString().slice(0, 10),
          segmentos: [],
        };

        const res = await fetch(`${getApiUrl()}/api/history`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ request, response: calculoState.data }),
        });
        if (res.ok) {
          const created = (await res.json()) as HistoryRow;
          nuevo.id = created.id;
        }
      } catch {
        // Fallback to local save
      }
    }

    setPeriodos((prev) => [...prev, nuevo]);
  }, [calculoState, isSignedIn, getToken, setPeriodos]);

  const eliminar = useCallback(
    async (id: string) => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          await fetch(`${getApiUrl()}/api/history/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch {
          // Fallback — remove locally
        }
      }
      setPeriodos((prev) => prev.filter((p) => p.id !== id));
    },
    [isSignedIn, getToken, setPeriodos],
  );

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">
          Historial de Periodos
        </h3>
        <button
          onClick={() => { void guardar(); }}
          className="rounded bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-light focus:ring-2 focus:ring-primary focus:outline-none"
        >
          Guardar periodo actual
        </button>
      </div>

      {loading && (
        <p className="mt-2 text-xs text-text-muted">Cargando historial...</p>
      )}

      {!loading && periodos.length === 0 && (
        <p className="mt-2 text-xs text-text-muted">
          No hay periodos guardados.
        </p>
      )}

      {periodos.length > 0 && (
        <ul className="mt-2 divide-y divide-border">
          {periodos.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between py-2"
            >
              <div className="text-xs text-text-secondary">
                <span className="font-medium">
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
                onClick={() => {
                  void eliminar(p.id);
                }}
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
