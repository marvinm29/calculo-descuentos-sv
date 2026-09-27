import type { CalcularRequest, CalcularResponse, Incentivo } from '../types';
import { calcularSalarioHora, calcularPagoSegmentos, round2 } from './horasExtra.js';
import { calcularDescuentos } from './descuentos.js';
import { calcularPrestaciones } from './prestaciones.js';

function sumIncentivosGravados(incentivos: Incentivo[]): number {
  return round2(
    incentivos.filter((i) => i.aplicaDescuentos).reduce((sum, i) => sum + i.monto, 0),
  );
}

function sumIncentivosNoGravados(incentivos: Incentivo[]): number {
  return round2(
    incentivos.filter((i) => !i.aplicaDescuentos).reduce((sum, i) => sum + i.monto, 0),
  );
}

/**
 * Motor de cálculo del producto (ADR-001: única implementación, usada por la
 * web offline y por el API validador). Orquesta: pago de segmentos (Art.
 * 168-173 CT) + incentivos → bruto; ISSS/AFP/renta → descuentos; prestaciones
 * informativas aparte; `neto = brutoTotal − totalDescuentos`.
 *
 * Invariantes (openspec/specs/dominio-calculo.md):
 * - Los segmentos `regular_*` pagan 0 (el salario base no se deriva de horas
 *   ordinarias).
 * - Los incentivos no gravados suman al bruto total sin cotizar.
 * - Las prestaciones son informativas y no tocan el líquido.
 */
export function calcular(request: CalcularRequest): CalcularResponse {
  const {
    salarioBase,
    tipoPago,
    antiguedad,
    fechaIngreso,
    fechaFin,
    segmentos,
    incentivos,
  } = request;
  const factorPeriodo = tipoPago === 'quincenal' ? 0.5 : 1;

  const { salarioHoraDiurna } = calcularSalarioHora(salarioBase);

  const pagoSegmentos = calcularPagoSegmentos(segmentos, salarioHoraDiurna);

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
