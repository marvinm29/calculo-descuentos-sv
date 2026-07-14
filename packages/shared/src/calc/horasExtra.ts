import type { SegmentoHorario, TipoJornada } from '../types';
import { HORAS_EXTRA } from '../tasas';

const DIAS_LABORALES = 30;
const HORAS_DIURNAS_AL_DIA = 8;

interface SalarioHora {
  salarioDiario: number;
  salarioHoraDiurna: number;
  salarioHoraNocturna: number;
}

export function calcularSalarioHora(salarioMensual: number): SalarioHora {
  const salarioDiario = salarioMensual / DIAS_LABORALES;
  const salarioHoraDiurna = salarioDiario / HORAS_DIURNAS_AL_DIA;
  const salarioHoraNocturna = salarioHoraDiurna * HORAS_EXTRA.NOCTURNIDAD;

  return { salarioDiario, salarioHoraDiurna, salarioHoraNocturna };
}

const FACTOR_POR_TIPO: Record<TipoJornada, number> = {
  regular_diurna: 0,
  regular_nocturna: 0,
  extra_diurna: HORAS_EXTRA.EXTRA_DIURNA,
  extra_nocturna: HORAS_EXTRA.EXTRA_NOCTURNA,
  dia_libre_diurna: HORAS_EXTRA.DIA_LIBRE_DIURNA,
  dia_libre_nocturna: HORAS_EXTRA.DIA_LIBRE_NOCTURNA,
  asueto: HORAS_EXTRA.ASUETO,
};

export interface PagoSegmentos {
  horasExtraDiurna: number;
  horasExtraNocturna: number;
  diaLibreDiurna: number;
  diaLibreNocturna: number;
  asueto: number;
  totalHorasExtra: number;
}

export function calcularPagoSegmentos(
  segmentos: SegmentoHorario[],
  salarioHoraDiurna: number,
): PagoSegmentos {
  let horasExtraDiurna = 0;
  let horasExtraNocturna = 0;
  let diaLibreDiurna = 0;
  let diaLibreNocturna = 0;
  let asueto = 0;
  let totalHorasExtra = 0;

  for (const s of segmentos) {
    const factor = FACTOR_POR_TIPO[s.tipo];
    const pago = round2(salarioHoraDiurna * factor * s.horas);

    switch (s.tipo) {
      case 'extra_diurna':
        horasExtraDiurna += pago;
        totalHorasExtra += s.horas;
        break;
      case 'extra_nocturna':
        horasExtraNocturna += pago;
        totalHorasExtra += s.horas;
        break;
      case 'dia_libre_diurna':
        diaLibreDiurna += pago;
        totalHorasExtra += s.horas;
        break;
      case 'dia_libre_nocturna':
        diaLibreNocturna += pago;
        totalHorasExtra += s.horas;
        break;
      case 'asueto':
        asueto += pago;
        totalHorasExtra += s.horas;
        break;
    }
  }

  return {
    horasExtraDiurna: round2(horasExtraDiurna),
    horasExtraNocturna: round2(horasExtraNocturna),
    diaLibreDiurna: round2(diaLibreDiurna),
    diaLibreNocturna: round2(diaLibreNocturna),
    asueto: round2(asueto),
    totalHorasExtra: round2(totalHorasExtra),
  };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
