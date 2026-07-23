import { useMemo } from 'react';
import { calcular, JORNADA } from '@calc/shared';
import type {
  CalculoState,
  CalcularRequest,
  SegmentoHorario,
  JornadaConfig,
  SemanaRegistro,
} from '@calc/shared';
import { useAppContext } from '../context/AppContext';

export function autoConvertirExceso(
  jornada: JornadaConfig,
  semanas: SemanaRegistro[],
): SemanaRegistro[] {
  const maxSemanal =
    jornada.modalidad === 'nocturna'
      ? JORNADA.NOCTURNA_SEMANAL
      : JORNADA.DIURNA_SEMANAL;

  const horasConfiguradas =
    jornada.tipo === 'tiempo_completo' ? maxSemanal : jornada.horasSemanales;

  const excesoSemanal = Math.max(0, horasConfiguradas - maxSemanal);
  if (excesoSemanal === 0 || semanas.length === 0) return semanas;

  return semanas.map((s) => {
    if (jornada.modalidad === 'nocturna') {
      return { ...s, extraNocturna: s.extraNocturna + excesoSemanal };
    }
    return { ...s, extraDiurna: s.extraDiurna + excesoSemanal };
  });
}

function semanasASegmentos(
  semanas: SemanaRegistro[],
  fechaInicio: string,
): SegmentoHorario[] {
  const segmentos: SegmentoHorario[] = [];
  const baseDate = new Date(fechaInicio);

  for (let i = 0; i < semanas.length; i++) {
    const s = semanas[i]!;
    const fecha = new Date(baseDate);
    fecha.setDate(fecha.getDate() + i * 7);
    const fechaStr = fecha.toISOString().slice(0, 10);

    if (s.extraDiurna > 0) {
      segmentos.push({ fecha: fechaStr, tipo: 'extra_diurna', horas: s.extraDiurna });
    }
    if (s.extraNocturna > 0) {
      segmentos.push({ fecha: fechaStr, tipo: 'extra_nocturna', horas: s.extraNocturna });
    }
    if (s.diaLibreDiurna > 0) {
      segmentos.push({ fecha: fechaStr, tipo: 'dia_libre_diurna', horas: s.diaLibreDiurna });
    }
    if (s.diaLibreNocturna > 0) {
      segmentos.push({ fecha: fechaStr, tipo: 'dia_libre_nocturna', horas: s.diaLibreNocturna });
    }
    if (s.asueto > 0) {
      segmentos.push({ fecha: fechaStr, tipo: 'asueto', horas: s.asueto });
    }
  }

  return segmentos;
}

export function useCalculos(): CalculoState {
  const { config, jornada, registroPeriodo, incentivos } = useAppContext();

  return useMemo((): CalculoState => {
    if (config.salarioBase <= 0) {
      return { status: 'idle' };
    }

    const hoy = new Date().toISOString().slice(0, 10);

    const semanasConvertidas = autoConvertirExceso(jornada, registroPeriodo);
    const segmentos = semanasASegmentos(semanasConvertidas, hoy);

    const horasBaseNocturnasTotal = registroPeriodo.reduce(
      (sum, s) => sum + s.horasBaseNocturnas,
      0,
    );

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
  }, [config, jornada, registroPeriodo, incentivos]);
}
