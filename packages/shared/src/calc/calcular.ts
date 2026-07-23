import type { CalcularRequest, CalcularResponse, Incentivo } from '../types';
import {
  calcularSalarioHora,
  calcularPagoSegmentos,
  calcularRecargoNocturnidad,
  round2,
} from './horasExtra.js';
import { calcularDescuentos } from './descuentos.js';
import { calcularPrestaciones } from './prestaciones.js';

function sumIncentivosGravados(incentivos: Incentivo[]): number {
  return round2(
    incentivos
      .filter((i) => i.aplicaDescuentos)
      .reduce((sum, i) => sum + i.monto, 0),
  );
}

function sumIncentivosNoGravados(incentivos: Incentivo[]): number {
  return round2(
    incentivos
      .filter((i) => !i.aplicaDescuentos)
      .reduce((sum, i) => sum + i.monto, 0),
  );
}

export function calcular(request: CalcularRequest): CalcularResponse {
  const {
    salarioBase,
    tipoPago,
    antiguedad,
    fechaIngreso,
    fechaFin,
    segmentos,
    horasBaseNocturnas,
    incentivos,
  } = request;
  const factorPeriodo = tipoPago === 'quincenal' ? 0.5 : 1;

  const { salarioHoraDiurna } = calcularSalarioHora(salarioBase);

  const pagoSegmentos = calcularPagoSegmentos(segmentos, salarioHoraDiurna);

  const recargoNocturnidad =
    horasBaseNocturnas != null
      ? calcularRecargoNocturnidad(salarioBase, horasBaseNocturnas)
      : 0;

  const incentivosArray = incentivos ?? [];
  const incentivosGravados = sumIncentivosGravados(incentivosArray);
  const incentivosNoGravados = sumIncentivosNoGravados(incentivosArray);
  const totalIncentivos = round2(incentivosGravados + incentivosNoGravados);

  const salarioBasePeriodo = round2(salarioBase * factorPeriodo);

  const brutoGravable = round2(
    salarioBasePeriodo +
      pagoSegmentos.horasExtraDiurna +
      pagoSegmentos.horasExtraNocturna +
      pagoSegmentos.diaLibreDiurna +
      pagoSegmentos.diaLibreNocturna +
      pagoSegmentos.asueto +
      recargoNocturnidad +
      incentivosGravados,
  );

  const brutoTotal = round2(brutoGravable + incentivosNoGravados);

  const descuentos = calcularDescuentos(brutoGravable, tipoPago);
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
      recargoNocturnidad,
      incentivos: totalIncentivos,
      incentivosGravados,
      brutoTotal,
    },
    descuentos,
    prestaciones,
    neto: {
      salarioLiquido,
    },
  };
}
