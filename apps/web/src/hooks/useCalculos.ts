import { useMemo } from 'react';
import { calcular, JORNADA } from '@calc/shared';
import type {
  CalculoState,
  CalcularRequest,
  SegmentoHorario,
  EntradaPeriodo,
  JornadaConfig,
} from '@calc/shared';
import { useAppContext } from '../context/AppContext';

export function entradasASegmentos(
  entradas: EntradaPeriodo[],
  jornada: JornadaConfig,
): { segmentos: SegmentoHorario[]; horasBaseNocturnas: number } {
  const segmentos: SegmentoHorario[] = [];

  for (const e of entradas) {
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

  const horasBaseNocturnas =
    jornada.modalidad === 'nocturna'
      ? new Set(entradas.map((e) => e.fecha)).size * JORNADA.NOCTURNA_DIARIA
      : 0;

  return { segmentos, horasBaseNocturnas };
}

export function useCalculos(): CalculoState {
  const { config, jornada, entradas, incentivos } = useAppContext();

  return useMemo((): CalculoState => {
    if (config.salarioBase <= 0) {
      return { status: 'idle' };
    }

    const hoy = new Date().toISOString().slice(0, 10);

    const { segmentos, horasBaseNocturnas } = entradasASegmentos(entradas, jornada);

    const request: CalcularRequest = {
      salarioBase: config.salarioBase,
      tipoPago: config.tipoPago,
      fechaInicio: hoy,
      fechaFin: hoy,
      antiguedad: config.antiguedad,
      fechaIngreso: config.fechaIngreso || hoy,
      segmentos,
      horasBaseNocturnas: horasBaseNocturnas > 0 ? horasBaseNocturnas : undefined,
      incentivos: incentivos.length > 0 ? incentivos : undefined,
    };

    try {
      const data = calcular(request);
      return { status: 'success', data, request };
    } catch (err) {
      return {
        status: 'error',
        error: err instanceof Error ? err.message : 'Error de cálculo',
      };
    }
  }, [config, jornada, entradas, incentivos]);
}
