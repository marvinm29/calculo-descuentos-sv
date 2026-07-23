import { useMemo } from 'react';
import { calcular } from '@calc/shared';
import type {
  CalculoState,
  CalcularRequest,
  SegmentoHorario,
} from '@calc/shared';
import type { DiaRegistro } from '../components/registroTypes';
import {
  horasDiurnasDeBloques,
  horasNocturnasDeBloques,
  totalHorasBloques,
} from '../components/registroTypes';
import { useAppContext } from '../context/AppContext';

function semanaASegmentos(
  dias: DiaRegistro[],
  fechaStr: string,
): { segmentos: SegmentoHorario[]; horasBaseNocturnas: number } {
  const segmentos: SegmentoHorario[] = [];
  let horasBaseNocturnas = 0;

  for (const d of dias) {
    const diurnas = horasDiurnasDeBloques(d.bloques);
    const nocturnas = horasNocturnasDeBloques(d.bloques);
    if (diurnas <= 0 && nocturnas <= 0) continue;

    if (d.jornadaBase === 'regular_nocturna') {
      horasBaseNocturnas += diurnas;
      if (nocturnas > 0) {
        segmentos.push({ fecha: fechaStr, tipo: 'extra_nocturna', horas: nocturnas });
      }
    } else if (d.jornadaBase === 'regular_diurna') {
      if (nocturnas > 0) {
        segmentos.push({ fecha: fechaStr, tipo: 'extra_nocturna', horas: nocturnas });
      }
    } else if (d.jornadaBase === 'descanso') {
      if (diurnas > 0) {
        segmentos.push({ fecha: fechaStr, tipo: 'dia_libre_diurna', horas: diurnas });
      }
      if (nocturnas > 0) {
        segmentos.push({ fecha: fechaStr, tipo: 'dia_libre_nocturna', horas: nocturnas });
      }
    } else if (d.jornadaBase === 'asueto') {
      const total = totalHorasBloques(d.bloques);
      if (total > 0) segmentos.push({ fecha: fechaStr, tipo: 'asueto', horas: total });
    }
  }

  return { segmentos, horasBaseNocturnas };
}

function semanasADatos(
  registro: Record<string, DiaRegistro[]>,
  fechaInicio: string,
): { segmentos: SegmentoHorario[]; horasBaseNocturnasTotal: number } {
  const todosSegmentos: SegmentoHorario[] = [];
  let horasBaseNocturnasTotal = 0;
  const baseDate = new Date(fechaInicio);
  let i = 0;

  for (const semanaId of Object.keys(registro)) {
    const dias = registro[semanaId];
    if (!dias || dias.length === 0) continue;

    const fecha = new Date(baseDate);
    fecha.setDate(fecha.getDate() + i * 7);
    const fechaStr = fecha.toISOString().slice(0, 10);

    const { segmentos, horasBaseNocturnas } = semanaASegmentos(dias, fechaStr);
    todosSegmentos.push(...segmentos);
    horasBaseNocturnasTotal += horasBaseNocturnas;
    i++;
  }

  return { segmentos: todosSegmentos, horasBaseNocturnasTotal };
}

export function useCalculos(): CalculoState {
  const { config, jornada, registro, incentivos } = useAppContext();

  return useMemo((): CalculoState => {
    if (config.salarioBase <= 0) {
      return { status: 'idle' };
    }

    const hoy = new Date().toISOString().slice(0, 10);

    const { segmentos, horasBaseNocturnasTotal } = semanasADatos(registro, hoy);

    const request: CalcularRequest = {
      salarioBase: config.salarioBase,
      tipoPago: config.tipoPago,
      fechaInicio: hoy,
      fechaFin: hoy,
      antiguedad: config.antiguedad,
      fechaIngreso: config.fechaIngreso || hoy,
      segmentos,
      horasBaseNocturnas: horasBaseNocturnasTotal > 0 ? horasBaseNocturnasTotal : undefined,
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
  }, [config, jornada, registro, incentivos]);
}
