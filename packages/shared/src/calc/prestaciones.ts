import type { Antiguedad, PrestacionesResponse } from '../types';
import { AGUINALDO_DIAS, VACACIONES, QUINCENA_25 } from '../tasas.js';
import { round2, calcularSalarioHora } from './horasExtra.js';

/**
 * Prestaciones de ley — informativas: las paga el empleador por separado y NO
 * afectan el salario líquido (CONTEXT.md "Reglas no obvias"). Cálculos sobre el
 * salario base mensual, sin horas extra ni incentivos.
 */

/**
 * Aguinaldo (Art. 198-200 CT): días de salario según antigüedad
 * (15/15/19/21, `AGUINALDO_DIAS`). Con menos de 1 año es proporcional:
 * `(días laborados / 365) × 15 × salarioDiario`.
 *
 * `fechaIngreso` y `fechaFinPeriodo` son fechas de calendario ISO `YYYY-MM-DD`
 * (validadas por schema). `new Date(...)` las interpreta como medianoche UTC;
 * la diferencia en ms es inmune a la zona horaria porque ambas se parsean
 * igual. La prohibición de UTC (FE-14) aplica a fechas mostradas/creadas en el
 * cliente, no a esta diferencia.
 */
export function calcularAguinaldo(
  salarioMensual: number,
  antiguedad: Antiguedad,
  fechaIngreso: string,
  fechaFinPeriodo: string,
): NonNullable<PrestacionesResponse['aguinaldo']> {
  const { salarioDiario } = calcularSalarioHora(salarioMensual);

  if (antiguedad === 'menos_1') {
    const ingreso = new Date(fechaIngreso);
    const fin = new Date(fechaFinPeriodo);
    const ms = fin.getTime() - ingreso.getTime();
    const diasLaborados = Math.max(1, Math.floor(ms / (1000 * 60 * 60 * 24)));
    const diasProporcional = (diasLaborados / 365) * AGUINALDO_DIAS.MENOS_1;
    const monto = round2(diasProporcional * salarioDiario);
    return { dias: round2(diasProporcional), monto, proporcional: true };
  }

  let diasValor: number;
  switch (antiguedad) {
    case '1_a_3':
      diasValor = AGUINALDO_DIAS.DE_1_A_3;
      break;
    case '3_a_9':
      diasValor = AGUINALDO_DIAS.DE_3_A_9;
      break;
    case '10_o_mas':
      diasValor = AGUINALDO_DIAS.DE_10_O_MAS;
      break;
    default:
      diasValor = AGUINALDO_DIAS.DE_1_A_3;
  }

  const monto = round2(diasValor * salarioDiario);
  return { dias: diasValor, monto, proporcional: false };
}

/**
 * Vacaciones (Art. 177 CT): 15 días de salario diurno + bono vacacional del
 * 30% (`VACACIONES`). El bono NO está sujeto a ISSS/AFP/Renta.
 */
export function calcularVacaciones(
  salarioMensual: number,
): NonNullable<PrestacionesResponse['vacaciones']> {
  const { salarioDiario } = calcularSalarioHora(salarioMensual);
  const monto = round2(
    salarioDiario * VACACIONES.DIAS_POR_ANO * VACACIONES.BONO_PORCENTAJE,
  );
  return {
    porcentaje: round2(VACACIONES.BONO_PORCENTAJE * 100),
    monto,
  };
}

/**
 * Quincena 25 (Ley Especial, 2026): 50% del salario mensual si este no excede
 * $1,500 (`QUINCENA_25`). No sujeto a descuentos. Devuelve null si el salario
 * supera el tope (no aplica).
 */
export function calcularQuincena25(
  salarioMensual: number,
): NonNullable<PrestacionesResponse['quincena25']> | null {
  if (salarioMensual > QUINCENA_25.SALARIO_MAXIMO) {
    return null;
  }
  const monto = round2(salarioMensual * QUINCENA_25.PORCENTAJE);
  return {
    porcentaje: round2(QUINCENA_25.PORCENTAJE * 100),
    monto,
  };
}

/**
 * Orquestador de prestaciones (aguinaldo + vacaciones + Quincena 25).
 * Informativas: no entran al bruto ni al neto.
 */
export function calcularPrestaciones(
  salarioMensual: number,
  antiguedad: Antiguedad,
  fechaIngreso: string,
  fechaFinPeriodo: string,
): PrestacionesResponse {
  return {
    aguinaldo: calcularAguinaldo(
      salarioMensual,
      antiguedad,
      fechaIngreso,
      fechaFinPeriodo,
    ),
    vacaciones: calcularVacaciones(salarioMensual),
    quincena25: calcularQuincena25(salarioMensual),
  };
}
