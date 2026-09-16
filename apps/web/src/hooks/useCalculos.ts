import { useMemo } from 'react';
import {
  calcular,
  calcularRequestSchema,
  validarNegocio,
  esFechaCalendarioValida,
} from '@calc/shared';
import type {
  CalculoState,
  CalcularRequest,
  SegmentoHorario,
  EntradaPeriodo,
  Incentivo,
} from '@calc/shared';
import { useAppContext } from '../context/AppContext';

// Convierte EntradaPeriodo[] en SegmentoHorario[].
// Sin heurísticas: cada segmento proviene de horas explícitamente capturadas
// (openspec/specs/integridad-calculo.md, Regla 7). Las filas con fecha
// inválida se descartan (no alimentan el cálculo).
export function entradasASegmentos(
  entradas: EntradaPeriodo[],
): SegmentoHorario[] {
  const segmentos: SegmentoHorario[] = [];

  for (const e of entradas) {
    if (!esFechaCalendarioValida(e.fecha)) continue;
    if (e.horasDiurnas <= 0 && e.horasNocturnas <= 0) continue;

    if (e.tipo === 'extra') {
      if (e.horasDiurnas > 0) {
        segmentos.push({ fecha: e.fecha, tipo: 'extra_diurna', horas: e.horasDiurnas });
      }
      if (e.horasNocturnas > 0) {
        segmentos.push({ fecha: e.fecha, tipo: 'extra_nocturna', horas: e.horasNocturnas });
      }
    } else if (e.tipo === 'dia_libre') {
      if (e.horasDiurnas > 0) {
        segmentos.push({ fecha: e.fecha, tipo: 'dia_libre_diurna', horas: e.horasDiurnas });
      }
      if (e.horasNocturnas > 0) {
        segmentos.push({ fecha: e.fecha, tipo: 'dia_libre_nocturna', horas: e.horasNocturnas });
      }
    } else if (e.tipo === 'asueto') {
      const total = e.horasDiurnas + e.horasNocturnas;
      if (total > 0) {
        segmentos.push({ fecha: e.fecha, tipo: 'asueto', horas: total });
      }
    }
  }

  return segmentos;
}

// Incentivos vacíos (sin concepto y sin monto) no se envían al cálculo.
export function incentivosValidos(incentivos: Incentivo[]): Incentivo[] {
  return incentivos.filter((i) => i.monto > 0 || i.concepto.trim() !== '');
}

function minFecha(a: string, b: string): string {
  return a < b ? a : b;
}

function maxFecha(a: string, b: string): string {
  return a > b ? a : b;
}

export function useCalculos(): CalculoState {
  const { config, entradas, incentivos } = useAppContext();

  return useMemo((): CalculoState => {
    if (config.salarioBase <= 0) {
      return { status: 'idle' };
    }

    const hoy = new Date().toISOString().slice(0, 10);
    const fechasCapturadas = entradas
      .filter((e) => esFechaCalendarioValida(e.fecha))
      .map((e) => e.fecha);

    // El período se deriva de las fechas capturadas ∪ {hoy} (Regla 2 y 5).
    const fechaInicio = fechasCapturadas.reduce(minFecha, hoy);
    const fechaFin = fechasCapturadas.reduce(maxFecha, hoy);

    const incentivosFiltrados = incentivosValidos(incentivos);

    const request: CalcularRequest = {
      salarioBase: config.salarioBase,
      tipoPago: config.tipoPago,
      fechaInicio,
      fechaFin,
      antiguedad: config.antiguedad,
      fechaIngreso: config.fechaIngreso || hoy,
      segmentos: entradasASegmentos(entradas),
      incentivos: incentivosFiltrados.length > 0 ? incentivosFiltrados : undefined,
    };

    // La UI aplica las mismas reglas que el API (contrato estricto).
    const parsed = calcularRequestSchema.safeParse(request);
    if (!parsed.success) {
      return {
        status: 'error',
        error: parsed.error.issues[0]?.message ?? 'Datos de entrada inválidos',
      };
    }
    const negocio = validarNegocio(parsed.data);
    if (negocio.length > 0) {
      return { status: 'error', error: negocio[0]!.message };
    }

    try {
      const data = calcular(parsed.data);
      return { status: 'success', data, request };
    } catch (err) {
      return {
        status: 'error',
        error: err instanceof Error ? err.message : 'Error de cálculo',
      };
    }
  }, [config, entradas, incentivos]);
}
