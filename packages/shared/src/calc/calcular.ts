import type { CalcularRequest, CalcularResponse } from '../types';
import { calcularSalarioHora, calcularPagoSegmentos, round2 } from './horasExtra';
import { calcularDescuentos } from './descuentos';
import { calcularPrestaciones } from './prestaciones';

export function calcular(request: CalcularRequest): CalcularResponse {
  const { salarioBase, tipoPago, antiguedad, fechaIngreso, fechaFin, segmentos } =
    request;
  const factorPeriodo = tipoPago === 'quincenal' ? 0.5 : 1;

  const { salarioHoraDiurna } = calcularSalarioHora(salarioBase);

  const pagoSegmentos = calcularPagoSegmentos(segmentos, salarioHoraDiurna);

  const salarioBasePeriodo = round2(salarioBase * factorPeriodo);

  const brutoTotal = round2(
    salarioBasePeriodo +
      pagoSegmentos.horasExtraDiurna +
      pagoSegmentos.horasExtraNocturna +
      pagoSegmentos.diaLibreDiurna +
      pagoSegmentos.diaLibreNocturna +
      pagoSegmentos.asueto,
  );

  const descuentos = calcularDescuentos(brutoTotal, tipoPago);
  const prestaciones = calcularPrestaciones(
    salarioBase,
    antiguedad,
    fechaIngreso,
    fechaFin,
  );

  const salarioLiquido = round2(brutoTotal - descuentos.totalDescuentos);

  return {
    bruto: {
      salarioBase: salarioBasePeriodo,
      horasExtraDiurna: pagoSegmentos.horasExtraDiurna,
      horasExtraNocturna: pagoSegmentos.horasExtraNocturna,
      diaLibreDiurna: pagoSegmentos.diaLibreDiurna,
      diaLibreNocturna: pagoSegmentos.diaLibreNocturna,
      asueto: pagoSegmentos.asueto,
      brutoTotal,
    },
    descuentos,
    prestaciones,
    neto: {
      salarioLiquido,
    },
  };
}
