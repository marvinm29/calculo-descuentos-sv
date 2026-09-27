import type { SegmentoHorario, TipoJornada } from '../types';
import { DIVISORES_SALARIO, HORAS_EXTRA } from '../tasas.js';

/**
 * Pago de horas extraordinarias y trabajo en día de descanso/asueto
 * (Art. 168-173 CT). Los factores ya incluyen la compensación por
 * nocturnidad (2.25×/1.75×); no existe recargo nocturno inferido
 * (ver openspec/specs/dominio-calculo.md y ADR-010).
 */

interface SalarioHora {
  salarioDiario: number;
  salarioHoraDiurna: number;
}

/**
 * Convierte salario mensual en diario y por hora diurna.
 * `salarioDiario = mensual / 30` y `salarioHoraDiurna = diario / 8`
 * (Art. 168 CT; divisores en `DIVISORES_SALARIO`).
 */
export function calcularSalarioHora(salarioMensual: number): SalarioHora {
  const salarioDiario = salarioMensual / DIVISORES_SALARIO.DIAS_MES;
  const salarioHoraDiurna = salarioDiario / DIVISORES_SALARIO.HORAS_JORNADA_DIURNA;
  return { salarioDiario, salarioHoraDiurna };
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

/**
 * Paga cada segmento según su factor legal y agrega los montos por categoría.
 * Los segmentos `regular_*` pagan 0: el salario base no se deriva de horas
 * ordinarias (Regla 7 de integridad; CONTEXT.md "Reglas no obvias").
 */
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

/**
 * Redondeo monetario a 2 decimales (half-up sobre el doble binario).
 * Precaución: sobre floats no exactos (ej. 1.005) el resultado depende de la
 * representación binaria; los valores legales de entrada tienen 2 decimales,
 * así que la deriva solo puede aparecer en centavos de productos intermedios.
 */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
