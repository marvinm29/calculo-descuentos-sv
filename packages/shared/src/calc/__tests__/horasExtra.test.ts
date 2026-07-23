import { describe, it, expect } from 'vitest';
import {
  calcularSalarioHora,
  calcularRecargoNocturnidad,
  calcularPagoSegmentos,
  round2,
} from '../horasExtra';
import { HORAS_EXTRA, RECARGO_NOCTURNIDAD } from '../../tasas';
import type { SegmentoHorario } from '../../types';

describe('calcularSalarioHora', () => {
  it('calcula salario diario y por hora para un salario mensual de $800', () => {
    const { salarioDiario, salarioHoraDiurna } = calcularSalarioHora(800);

    expect(salarioDiario).toBeCloseTo(26.67, 2);
    expect(salarioHoraDiurna).toBeCloseTo(3.33, 2);
  });

  it('salario 0 da salarioHora 0', () => {
    const { salarioHoraDiurna } = calcularSalarioHora(0);
    expect(salarioHoraDiurna).toBe(0);
  });
});

describe('calcularRecargoNocturnidad', () => {
  it('calcula recargo = horasBaseNocturnas × salarioHora × 0.25', () => {
    const result = calcularRecargoNocturnidad(800, 39);
    const horaDiurna = 800 / 30 / 8;
    expect(result).toBeCloseTo(39 * horaDiurna * RECARGO_NOCTURNIDAD, 2);
  });

  it('trazable al ejemplo MTPS $1.04 → $1.30', () => {
    // $250 salario → hora diurna = 250/30/8 ≈ 1.0417
    // recargo = 1.0417 × 0.25 ≈ 0.26
    const result = calcularRecargoNocturnidad(250, 1);
    expect(result).toBeCloseTo(0.26, 2);
  });

  it('0 horas base nocturnas → 0 recargo', () => {
    expect(calcularRecargoNocturnidad(800, 0)).toBe(0);
  });
});

describe('calcularPagoSegmentos', () => {
  const hora = 800 / 30 / 8;

  it('retorna 0 para segmentos regulares (diurna/nocturna)', () => {
    const segmentos: SegmentoHorario[] = [
      { fecha: '2026-07-01', tipo: 'regular_diurna', horas: 8 },
      { fecha: '2026-07-02', tipo: 'regular_nocturna', horas: 7 },
    ];
    const pago = calcularPagoSegmentos(segmentos, hora);
    expect(pago.horasExtraDiurna).toBe(0);
    expect(pago.horasExtraNocturna).toBe(0);
    expect(pago.diaLibreDiurna).toBe(0);
    expect(pago.diaLibreNocturna).toBe(0);
    expect(pago.asueto).toBe(0);
    expect(pago.totalHorasExtra).toBe(0);
  });

  it('calcula hora extra diurna con factor 2.00x (Art. 169 CT)', () => {
    const segmentos: SegmentoHorario[] = [
      { fecha: '2026-07-01', tipo: 'extra_diurna', horas: 2 },
    ];
    const pago = calcularPagoSegmentos(segmentos, hora);
    expect(pago.horasExtraDiurna).toBe(round2(hora * HORAS_EXTRA.EXTRA_DIURNA * 2));
    expect(pago.totalHorasExtra).toBe(2);
  });

  it('calcula hora extra nocturna con factor 2.25x', () => {
    const segmentos: SegmentoHorario[] = [
      { fecha: '2026-07-02', tipo: 'extra_nocturna', horas: 3 },
    ];
    const pago = calcularPagoSegmentos(segmentos, hora);
    expect(pago.horasExtraNocturna).toBe(
      round2(hora * HORAS_EXTRA.EXTRA_NOCTURNA * 3),
    );
  });

  it('calcula dia libre diurna con factor 1.50x (Art. 173 CT)', () => {
    const segmentos: SegmentoHorario[] = [
      { fecha: '2026-07-06', tipo: 'dia_libre_diurna', horas: 8 },
    ];
    const pago = calcularPagoSegmentos(segmentos, hora);
    expect(pago.diaLibreDiurna).toBe(
      round2(hora * HORAS_EXTRA.DIA_LIBRE_DIURNA * 8),
    );
  });

  it('calcula dia libre nocturna con factor 1.75x', () => {
    const segmentos: SegmentoHorario[] = [
      { fecha: '2026-07-06', tipo: 'dia_libre_nocturna', horas: 3 },
    ];
    const pago = calcularPagoSegmentos(segmentos, hora);
    expect(pago.diaLibreNocturna).toBe(
      round2(hora * HORAS_EXTRA.DIA_LIBRE_NOCTURNA * 3),
    );
  });

  it('calcula asueto con factor 2.00x', () => {
    const segmentos: SegmentoHorario[] = [
      { fecha: '2026-07-06', tipo: 'asueto', horas: 8 },
    ];
    const pago = calcularPagoSegmentos(segmentos, hora);
    expect(pago.asueto).toBe(round2(hora * HORAS_EXTRA.ASUETO * 8));
  });

  it('acumula multiples tipos de segmento', () => {
    const segmentos: SegmentoHorario[] = [
      { fecha: '2026-07-01', tipo: 'extra_diurna', horas: 2 },
      { fecha: '2026-07-01', tipo: 'extra_nocturna', horas: 1 },
      { fecha: '2026-07-06', tipo: 'dia_libre_diurna', horas: 8 },
      { fecha: '2026-07-06', tipo: 'dia_libre_nocturna', horas: 3 },
    ];
    const pago = calcularPagoSegmentos(segmentos, hora);

    expect(pago.horasExtraDiurna).toBeGreaterThan(0);
    expect(pago.horasExtraNocturna).toBeGreaterThan(0);
    expect(pago.diaLibreDiurna).toBeGreaterThan(0);
    expect(pago.diaLibreNocturna).toBeGreaterThan(0);
    expect(pago.asueto).toBe(0);
    expect(pago.totalHorasExtra).toBe(14);
  });

  it('pagos coinciden con fixture de specs/tasas-legales.md ($800/mes)', () => {
    // Ver specs/tasas-legales.md §172-177
    // $800 salario → extra diurna $6.67/h, nocturna $7.50/h,
    // dia libre diurna $5.00/h, dia libre nocturna $5.83/h
    const pago = calcularPagoSegmentos(
      [{ fecha: '2026-07-01', tipo: 'extra_diurna', horas: 1 }],
      hora,
    );
    expect(pago.horasExtraDiurna).toBe(6.67);

    const pagoNoc = calcularPagoSegmentos(
      [{ fecha: '2026-07-01', tipo: 'extra_nocturna', horas: 1 }],
      hora,
    );
    expect(pagoNoc.horasExtraNocturna).toBe(7.5);

    const pagoLibre = calcularPagoSegmentos(
      [{ fecha: '2026-07-06', tipo: 'dia_libre_diurna', horas: 1 }],
      hora,
    );
    expect(pagoLibre.diaLibreDiurna).toBe(5.0);

    const pagoLibreNoc = calcularPagoSegmentos(
      [{ fecha: '2026-07-06', tipo: 'dia_libre_nocturna', horas: 1 }],
      hora,
    );
    expect(pagoLibreNoc.diaLibreNocturna).toBe(5.83);
  });
});

describe('round2', () => {
  it('redondea a 2 decimales', () => {
    expect(round2(3.333)).toBe(3.33);
    expect(round2(3.335)).toBe(3.34);
    expect(round2(5.0)).toBe(5);
    expect(round2(0)).toBe(0);
  });
});
