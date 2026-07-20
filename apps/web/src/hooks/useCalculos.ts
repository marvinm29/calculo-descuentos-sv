import { useMemo } from 'react';
import { calcular } from '@calc/shared';
import type {
  CalculoState,
  CalcularRequest,
  SegmentoHorario,
  TipoJornada,
} from '@calc/shared';
import type { DiaRegistro } from '../components/registroTypes';
import { useAppContext } from '../context/AppContext';

function diasToSegmentos(
  dias: DiaRegistro[],
): SegmentoHorario[] {
  const segmentos: SegmentoHorario[] = [];

  for (const d of dias) {
    if (d.horasBase > 0 && d.jornadaBase !== 'descanso') {
      const tipo: TipoJornada =
        d.jornadaBase === 'regular_nocturna' || d.jornadaBase === 'asueto'
          ? d.jornadaBase
          : 'regular_diurna';
      segmentos.push({ fecha: d.fecha, tipo, horas: d.horasBase });
    }
    if (d.horasExtraDiurna > 0) {
      segmentos.push({
        fecha: d.fecha,
        tipo: 'extra_diurna',
        horas: d.horasExtraDiurna,
      });
    }
    if (d.horasExtraNocturna > 0) {
      segmentos.push({
        fecha: d.fecha,
        tipo: 'extra_nocturna',
        horas: d.horasExtraNocturna,
      });
    }
    if (d.horasDiaLibreDiurna > 0) {
      segmentos.push({
        fecha: d.fecha,
        tipo: 'dia_libre_diurna',
        horas: d.horasDiaLibreDiurna,
      });
    }
    if (d.horasDiaLibreNocturna > 0) {
      segmentos.push({
        fecha: d.fecha,
        tipo: 'dia_libre_nocturna',
        horas: d.horasDiaLibreNocturna,
      });
    }
    if (d.horasAsueto > 0) {
      segmentos.push({
        fecha: d.fecha,
        tipo: 'asueto',
        horas: d.horasAsueto,
      });
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
