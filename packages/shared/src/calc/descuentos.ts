import type { TipoPago, DescuentosResponse } from '../types';
import { ISSS, AFP, RENTA_TRAMOS_MENSUAL } from '../tasas.js';
import { round2 } from './horasExtra.js';

interface TramosRenta {
  tramo: number;
  desde: number;
  hasta: number;
  porcentajeExceso: number;
  cuotaFija: number;
}

function getTramosRenta(tipoPago: TipoPago): TramosRenta[] {
  if (tipoPago === 'quincenal') {
    return RENTA_TRAMOS_MENSUAL.map((t) => ({
      ...t,
      desde: round2(t.desde / 2),
      hasta: t.hasta === Infinity ? Infinity : round2(t.hasta / 2),
      cuotaFija: round2(t.cuotaFija / 2),
    }));
  }
  // Return a mutable copy for mensual
  return RENTA_TRAMOS_MENSUAL.map((t) => ({ ...t }));
}

function calcularISSSPeriodo(
  brutoPeriodo: number,
  divisor: number,
): { porcentaje: number; salarioAsegurable: number; descuento: number } {
  const topePeriodo = ISSS.TOPE_MENSUAL / divisor;
  const salarioAsegurable = round2(Math.min(brutoPeriodo, topePeriodo));
  const descuento = round2(salarioAsegurable * ISSS.PORCENTAJE_TRABAJADOR);
  return {
    porcentaje: ISSS.PORCENTAJE_TRABAJADOR * 100,
    salarioAsegurable,
    descuento,
  };
}

function calcularAFPPeriodo(
  brutoPeriodo: number,
  divisor: number,
): { porcentaje: number; salarioCotizable: number; descuento: number } {
  const topePeriodo = AFP.TOPE_MENSUAL / divisor;
  const salarioCotizable = round2(Math.min(brutoPeriodo, topePeriodo));
  const descuento = round2(salarioCotizable * AFP.PORCENTAJE_TRABAJADOR);
  return {
    porcentaje: round2(AFP.PORCENTAJE_TRABAJADOR * 100),
    salarioCotizable,
    descuento,
  };
}

function calcularRentaPeriodo(
  baseGravable: number,
  tramos: TramosRenta[],
): {
  baseGravable: number;
  tramo: number;
  porcentajeExceso: number;
  cuotaFija: number;
  descuento: number;
} {
  const bg = round2(baseGravable);
  for (const t of tramos) {
    if (bg >= t.desde && bg <= t.hasta) {
      const excedente = bg - t.desde;
      const descuento = round2(
        round2(excedente * t.porcentajeExceso) + t.cuotaFija,
      );
      return {
        baseGravable: bg,
        tramo: t.tramo,
        porcentajeExceso: round2(t.porcentajeExceso * 100),
        cuotaFija: t.cuotaFija,
        descuento: Math.max(0, descuento),
      };
    }
  }
  return {
    baseGravable: bg,
    tramo: 0,
    porcentajeExceso: 0,
    cuotaFija: 0,
    descuento: 0,
  };
}

export function calcularDescuentos(
  brutoPeriodo: number,
  tipoPago: TipoPago,
): DescuentosResponse {
  const divisor = tipoPago === 'quincenal' ? 2 : 1;

  const isss = calcularISSSPeriodo(brutoPeriodo, divisor);
  const afp = calcularAFPPeriodo(brutoPeriodo, divisor);

  const baseGravable = round2(brutoPeriodo - isss.descuento - afp.descuento);
  const tramos = getTramosRenta(tipoPago);
  const renta = calcularRentaPeriodo(baseGravable, tramos);

  const totalDescuentos = round2(
    isss.descuento + afp.descuento + renta.descuento,
  );

  return { isss, afp, renta, totalDescuentos };
}
