import { useMemo } from 'react';
import { calcular } from '@calc/shared';
import type {
  CalculoState,
  CalcularRequest,
  SegmentoHorario,
} from '@calc/shared';
import type { DiaRegistro } from '../components/registroTypes';
import { useAppContext } from '../context/AppContext';

function diasToSegmentos(
  dias: DiaRegistro[],
): SegmentoHorario[] {
  const segmentos: SegmentoHorario[] = [];

  for (const d of dias) {
    const { horasDiurna, horasNocturna, jornadaBase, fecha } = d;
    if (horasDiurna <= 0 && horasNocturna <= 0) continue;

    if (jornadaBase === 'regular_diurna') {
      if (horasDiurna > 0) {
        const base = Math.min(horasDiurna, 8);
        segmentos.push({ fecha, tipo: 'regular_diurna', horas: base });
        const extra = horasDiurna - base;
        if (extra > 0) segmentos.push({ fecha, tipo: 'extra_diurna', horas: extra });
      }
      if (horasNocturna > 0) {
        segmentos.push({ fecha, tipo: 'extra_nocturna', horas: horasNocturna });
      }
    } else if (jornadaBase === 'regular_nocturna') {
      if (horasNocturna > 0) {
        const base = Math.min(horasNocturna, 8);
        segmentos.push({ fecha, tipo: 'regular_nocturna', horas: base });
        const extra = horasNocturna - base;
        if (extra > 0) segmentos.push({ fecha, tipo: 'extra_nocturna', horas: extra });
      }
      if (horasDiurna > 0) {
        segmentos.push({ fecha, tipo: 'extra_diurna', horas: horasDiurna });
      }
    } else if (jornadaBase === 'descanso') {
      if (horasDiurna > 0) {
        segmentos.push({ fecha, tipo: 'dia_libre_diurna', horas: horasDiurna });
      }
      if (horasNocturna > 0) {
        segmentos.push({ fecha, tipo: 'dia_libre_nocturna', horas: horasNocturna });
      }
    } else if (jornadaBase === 'asueto') {
      const total = horasDiurna + horasNocturna;
      if (total > 0) segmentos.push({ fecha, tipo: 'asueto', horas: total });
    }
  }

  return segmentos;
}

export function useCalculos(): CalculoState {
  const { config, registro } = useAppContext();

  return useMemo((): CalculoState => {
    if (config.salarioBase <= 0) {
      return { status: 'idle' };
    }

    const semanaId = Object.keys(registro)[0];
    const dias = semanaId ? registro[semanaId] : undefined;
    const segmentos = dias ? diasToSegmentos(dias) : [];

    const request: CalcularRequest = {
      salarioBase: config.salarioBase,
      tipoPago: config.tipoPago,
      fechaInicio: dias?.[0]?.fecha ?? new Date().toISOString().slice(0, 10),
      fechaFin:
        dias?.[dias.length - 1]?.fecha ??
        new Date().toISOString().slice(0, 10),
      antiguedad: config.antiguedad,
      fechaIngreso: config.fechaIngreso || new Date().toISOString().slice(0, 10),
      segmentos,
    };

    try {
      const data = calcular(request);
      return { status: 'success', data };
    } catch (err) {
      return {
        status: 'error',
        error: err instanceof Error ? err.message : 'Error de cálculo',
      };
    }
  }, [config, registro]);
}
