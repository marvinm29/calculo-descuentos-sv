import { useState } from 'react';
import type { EntradaPeriodo, TipoEntrada } from '@calc/shared';
import { esFechaCalendarioValida, LIMITES_CONTRATO } from '@calc/shared';
import { hoyLocal } from '../lib/fecha';

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
    // FE-14: fecha LOCAL (YYYY-MM-DD), nunca toISOString() (UTC).
    fecha: hoyLocal(),
    tipo: 'extra',
    horasDiurnas: 0,
    horasNocturnas: 0,
  };
}

// Mismas reglas que el contrato (openspec/specs/integridad-calculo.md).
// El error identifica los campos causantes para asociar aria-describedby
// solo a ellos (FE-06) y no replicar el estado en toda la fila.
// Regla 4 en cliente (2026-09-20): NaN, ±Infinity, negativos y fuera de rango
// se detectan aquí, en el mismo evento de edición (captura-horas.md §
// Validación numérica en la UI).
export interface ErrorFila {
  mensaje: string;
  campos: Array<'fecha' | 'horas'>;
}

export function validarFila(
  e: EntradaPeriodo,
  todas: EntradaPeriodo[],
): ErrorFila | null {
  if (!esFechaCalendarioValida(e.fecha)) {
    return { mensaje: 'Fecha inválida', campos: ['fecha'] };
  }
  if (!Number.isFinite(e.horasDiurnas) || !Number.isFinite(e.horasNocturnas)) {
    return {
      mensaje: 'Las horas deben ser un número finito',
      campos: ['horas'],
    };
  }
  if (e.horasDiurnas < 0 || e.horasNocturnas < 0) {
    return {
      mensaje: 'Las horas no pueden ser negativas',
      campos: ['horas'],
    };
  }
  if (e.horasDiurnas > 24 || e.horasNocturnas > 24) {
    return {
      mensaje: 'Las horas no pueden exceder 24',
      campos: ['horas'],
    };
  }
  const totalDia = todas
    .filter((o) => o.fecha === e.fecha)
    .reduce((s, o) => s + o.horasDiurnas + o.horasNocturnas, 0);
  if (totalDia > LIMITES_CONTRATO.MAX_HORAS_DIARIAS) {
    return {
      mensaje: `La suma de horas del día excede ${LIMITES_CONTRATO.MAX_HORAS_DIARIAS} h`,
      campos: ['horas'],
    };
  }
  return null;
}

// FE-03: una fila mixta (extra/dia_libre con diurnas y nocturnas) proyecta DOS
// segmentos; `asueto` proyecta uno. El límite de MAX_SEGMENTOS se aplica sobre
// esta proyección, no sobre el número de filas.
export function segmentosProyectados(entradas: EntradaPeriodo[]): number {
  let total = 0;
  for (const e of entradas) {
    if (!esFechaCalendarioValida(e.fecha)) continue;
    if (e.tipo === 'asueto') {
      if (e.horasDiurnas + e.horasNocturnas > 0) total += 1;
    } else {
      if (e.horasDiurnas > 0) total += 1;
      if (e.horasNocturnas > 0) total += 1;
    }
  }
  return total;
}

export function EntradasPeriodo({ entradas, onChange }: EntradasPeriodoProps) {
  const proyectados = segmentosProyectados(entradas);
  const limiteAlcanzado = proyectados >= LIMITES_CONTRATO.MAX_SEGMENTOS;
  const [avisoLimite, setAvisoLimite] = useState<string | null>(null);

  // FE-03 (2026-09-20): el límite de MAX_SEGMENTOS cubre también la EDICIÓN de
  // una fila existente (una edición puede transformar un segmento en dos). El
  // estado candidato se valida ANTES de onChange: si excedería el límite, el
  // cambio no se aplica y se muestra un aviso no bloqueante con la salida
  // sugerida (reducir horas, cambiar tipo o eliminar filas).
  function update(index: number, partial: Partial<EntradaPeriodo>) {
    const candidata = entradas[index];
    if (!candidata) return;
    const nuevas = entradas.map((e, i) =>
      i === index ? { ...e, ...partial } : e,
    );
    if (segmentosProyectados(nuevas) > LIMITES_CONTRATO.MAX_SEGMENTOS) {
      setAvisoLimite(
        `La edición superaría el límite de ${LIMITES_CONTRATO.MAX_SEGMENTOS} segmentos proyectados. Reducí horas, cambiá el tipo o eliminá filas.`,
      );
      return;
    }
    setAvisoLimite(null);
    onChange(nuevas);
  }

  function eliminar(index: number) {
    onChange(entradas.filter((_, i) => i !== index));
  }

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text">Horas del Periodo</h3>
        <button
          type="button"
          onClick={() => onChange([...entradas, entradaVacia()])}
          disabled={limiteAlcanzado}
          title={
            limiteAlcanzado
              ? `Máximo ${LIMITES_CONTRATO.MAX_SEGMENTOS} segmentos proyectados`
              : undefined
          }
          className="btn-accent px-2.5 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          Agregar entrada
        </button>
      </div>

      <p className="mb-2 text-[10px] text-text-muted" aria-live="polite">
        Segmentos proyectados: {proyectados} / {LIMITES_CONTRATO.MAX_SEGMENTOS}
      </p>

      {avisoLimite && (
        <p className="mb-2 text-[10px] font-medium text-danger" role="alert">
          {avisoLimite}
        </p>
      )}

      {entradas.length === 0 && (
        <p className="text-xs text-text-muted">
          No hay entradas registradas. Agregá una para empezar.
        </p>
      )}

      <div className="space-y-2">
        {entradas.map((e, i) => {
          const error = validarFila(e, entradas);
          const errorId = `error-${e.id}`;
          const errorEnFecha = error?.campos.includes('fecha') ?? false;
          const errorEnHoras = error?.campos.includes('horas') ?? false;
          return (
          <div
            key={e.id}
            className="tool-card rounded-md p-3 flex flex-wrap items-end gap-2"
          >
            <div className="w-36">
              <label
                htmlFor={`fecha-${e.id}`}
                className="block text-[10px] font-medium text-text-secondary mb-0.5"
              >
                Fecha
              </label>
              <input
                id={`fecha-${e.id}`}
                type="date"
                value={e.fecha}
                onChange={(ev) => update(i, { fecha: ev.target.value })}
                aria-invalid={errorEnFecha}
                aria-describedby={errorEnFecha ? errorId : undefined}
                className="tool-input block w-full rounded-md px-2 py-1.5 text-xs"
              />
            </div>

            <div className="w-28">
              <label
                htmlFor={`diurnas-${e.id}`}
                className="block text-[10px] font-medium text-text-secondary mb-0.5"
              >
                Horas diurnas
              </label>
              <input
                id={`diurnas-${e.id}`}
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={e.horasDiurnas || ''}
                onChange={(ev) =>
                  update(i, { horasDiurnas: ev.target.value === '' ? 0 : Number(ev.target.value) })
                }
                aria-invalid={errorEnHoras}
                aria-describedby={errorEnHoras ? errorId : undefined}
                className="tool-input block w-full rounded-md px-2 py-1.5 text-xs"
              />
            </div>

            <div className="w-28">
              <label
                htmlFor={`nocturnas-${e.id}`}
                className="block text-[10px] font-medium text-text-secondary mb-0.5"
              >
                Horas nocturnas
              </label>
              <input
                id={`nocturnas-${e.id}`}
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={e.horasNocturnas || ''}
                onChange={(ev) =>
                  update(i, { horasNocturnas: ev.target.value === '' ? 0 : Number(ev.target.value) })
                }
                aria-invalid={errorEnHoras}
                aria-describedby={errorEnHoras ? errorId : undefined}
                className="tool-input block w-full rounded-md px-2 py-1.5 text-xs"
              />
            </div>

            <div className="w-40">
              <label
                htmlFor={`tipo-${e.id}`}
                className="block text-[10px] font-medium text-text-secondary mb-0.5"
              >
                Tipo
              </label>
              <select
                id={`tipo-${e.id}`}
                value={e.tipo}
                onChange={(ev) => update(i, { tipo: ev.target.value as TipoEntrada })}
                className="tool-input block w-full rounded-md px-2 py-1.5 text-xs"
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

            {error && (
              <p
                id={errorId}
                className="w-full text-[10px] font-medium text-danger"
                role="alert"
              >
                {error.mensaje}
              </p>
            )}
          </div>
          );
        })}
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
