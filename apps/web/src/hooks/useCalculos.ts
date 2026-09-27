import { useMemo } from 'react';
import {
  calcular,
  calcularRequestSchema,
  validarNegocio,
  esFechaCalendarioValida,
  LIMITES_CONTRATO,
} from '@calc/shared';
import type {
  CalculoState,
  CalcularRequest,
  SegmentoHorario,
  EntradaPeriodo,
  Incentivo,
} from '@calc/shared';
import { useAppContext } from '../context/AppContext';
import { hoyLocal } from '../lib/fecha';

// Regla 4 en cliente (captura-horas.md § Validación numérica en la UI): una
// fila con horas no finitas, negativas o fuera de rango NO alimenta el cálculo
// (igual que las filas con fecha inválida); la fila muestra su error inline.
function filaCumpleReglaNumerica(e: EntradaPeriodo): boolean {
  return (
    Number.isFinite(e.horasDiurnas) &&
    Number.isFinite(e.horasNocturnas) &&
    e.horasDiurnas >= 0 &&
    e.horasNocturnas >= 0 &&
    e.horasDiurnas <= 24 &&
    e.horasNocturnas <= 24
  );
}

// Proyección entrada → segmentos. Sin heurísticas: cada segmento proviene de
// horas explícitamente capturadas (openspec/specs/integridad-calculo.md,
// Regla 7). Las filas con fecha inválida o horas que violan la Regla 4 se
// descartan (no alimentan el cálculo).
export function entradasASegmentos(entradas: EntradaPeriodo[]): SegmentoHorario[] {
  const segmentos: SegmentoHorario[] = [];

  for (const e of entradas) {
    if (!esFechaCalendarioValida(e.fecha)) continue;
    if (!filaCumpleReglaNumerica(e)) continue;
    if (e.horasDiurnas <= 0 && e.horasNocturnas <= 0) continue;

    if (e.tipo === 'extra') {
      if (e.horasDiurnas > 0) {
        segmentos.push({ fecha: e.fecha, tipo: 'extra_diurna', horas: e.horasDiurnas });
      }
      if (e.horasNocturnas > 0) {
        segmentos.push({
          fecha: e.fecha,
          tipo: 'extra_nocturna',
          horas: e.horasNocturnas,
        });
      }
    } else if (e.tipo === 'dia_libre') {
      if (e.horasDiurnas > 0) {
        segmentos.push({
          fecha: e.fecha,
          tipo: 'dia_libre_diurna',
          horas: e.horasDiurnas,
        });
      }
      if (e.horasNocturnas > 0) {
        segmentos.push({
          fecha: e.fecha,
          tipo: 'dia_libre_nocturna',
          horas: e.horasNocturnas,
        });
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
// FE-04: la fila inválida (monto > 0 y concepto en blanco o solo espacios)
// tampoco se envía; el usuario la completa o la elimina (captura-horas.md §
// Incentivos en la UI). Regla 4 en cliente: montos no finitos, negativos o
// conceptos fuera de rango tampoco alimentan el cálculo (mismo criterio que
// las filas de horas; el error inline de la fila explica la causa).
export function incentivosValidos(incentivos: Incentivo[]): Incentivo[] {
  return incentivos.filter((i) => {
    if (!Number.isFinite(i.monto) || i.monto < 0) return false;
    if (i.concepto.trim().length > LIMITES_CONTRATO.MAX_CONCEPTO) return false;
    if (i.monto > 0 && i.concepto.trim() === '') return false;
    return i.monto > 0 || i.concepto.trim() !== '';
  });
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

    // FE-14: `hoy` es la fecha LOCAL del dispositivo (nunca toISOString/UTC).
    const hoy = hoyLocal();
    const fechasCapturadas = entradas
      .filter((e) => esFechaCalendarioValida(e.fecha))
      .map((e) => e.fecha);

    // FE-01 (Regla 2/5 de integridad): el periodo se deriva SOLO de las fechas
    // capturadas. `hoy` se usa únicamente cuando no hay ninguna fecha válida;
    // mezclar `hoy` con un histórico fabrica días y altera el cálculo.
    const fechaInicio =
      fechasCapturadas.length > 0 ? fechasCapturadas.reduce(minFecha) : hoy;
    const fechaFin =
      fechasCapturadas.length > 0 ? fechasCapturadas.reduce(maxFecha) : hoy;

    const incentivosFiltrados = incentivosValidos(incentivos);

    // Periodo histórico exige fecha de ingreso (captura-horas.md § Fechas,
    // 2026-09-20): no se sustituye por `hoy` — fabricaría `fechaIngreso >
    // fechaFin` (error genérico del schema) y un ingreso supuesto "hoy" no
    // representa una relación laboral histórica.
    if (!config.fechaIngreso && fechaFin < hoy) {
      return {
        status: 'error',
        error:
          'Definí la fecha de ingreso en Configuración para calcular un periodo histórico.',
      };
    }

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
