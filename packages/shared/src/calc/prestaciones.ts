import type { Antiguedad, PrestacionesResponse } from '../types';
import { AGUINALDO_DIAS, VACACIONES, QUINCENA_25 } from '../tasas.js';
import { round2, calcularSalarioHora } from './horasExtra.js';

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
    const diasProporcional =
      (diasLaborados / 365) * AGUINALDO_DIAS.MENOS_1;
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
