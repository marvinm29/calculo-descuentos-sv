import { useMemo } from 'react';
import { calcular } from '@calc/shared';
import type {
  CalculoState,
  CalcularRequest,
  SegmentoHorario,
} from '@calc/shared';
import type { DiaRegistro } from '../components/registroTypes';
import { horasDiurnasDeBloques, horasNocturnasDeBloques } from '../components/registroTypes';
import { useAppContext } from '../context/AppContext';

function diasToSegmentos(
  dias: DiaRegistro[],
): SegmentoHorario[] {
  const segmentos: SegmentoHorario[] = [];

  for (const d of dias) {
    const diurnas = horasDiurnasDeBloques(d.bloques);
    const nocturnas = horasNocturnasDeBloques(d.bloques);
    const { jornadaBase, fecha } = d;
    if (diurnas <= 0 && nocturnas <= 0) continue;

    if (jornadaBase === 'regular_diurna') {
      if (diurnas > 0) {
        const base = Math.min(diurnas, 8);
        segmentos.push({ fecha, tipo: 'regular_diurna', horas: base });
        const extra = diurnas - base;
        if (extra > 0) segmentos.push({ fecha, tipo: 'extra_diurna', horas: extra });
      }
      if (nocturnas > 0) {
        segmentos.push({ fecha, tipo: 'extra_nocturna', horas: nocturnas });
      }
    } else if (jornadaBase === 'regular_nocturna') {
      if (nocturnas > 0) {
        const base = Math.min(nocturnas, 8);
        segmentos.push({ fecha, tipo: 'regular_nocturna', horas: base });
        const extra = nocturnas - base;
        if (extra > 0) segmentos.push({ fecha, tipo: 'extra_nocturna', horas: extra });
      }
      if (diurnas > 0) {
        segmentos.push({ fecha, tipo: 'extra_diurna', horas: diurnas });
      }
    } else if (jornadaBase === 'descanso') {
      if (diurnas > 0) {
        segmentos.push({ fecha, tipo: 'dia_libre_diurna', horas: diurnas });
      }
      if (nocturnas > 0) {
        segmentos.push({ fecha, tipo: 'dia_libre_nocturna', horas: nocturnas });
      }
    } else if (jornadaBase === 'asueto') {
      const total = diurnas + nocturnas;
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
