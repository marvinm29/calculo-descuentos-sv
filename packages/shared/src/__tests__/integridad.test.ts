import { describe, it, expect } from 'vitest';
import { calcularRequestSchema, validarNegocio, esFechaCalendarioValida } from '../schemas';
import type { CalcularRequest } from '../types';

const base: CalcularRequest = {
  salarioBase: 800,
  tipoPago: 'mensual',
  fechaInicio: '2026-07-01',
  fechaFin: '2026-07-15',
  antiguedad: '1_a_3',
  fechaIngreso: '2025-01-15',
  segmentos: [],
};

function parseOk(req: unknown): boolean {
  return calcularRequestSchema.safeParse(req).success;
}

function parsePaths(req: unknown): string[] {
  const r = calcularRequestSchema.safeParse(req);
  if (r.success) return [];
  return r.error.issues.map((i) => i.path.join('.'));
}

describe('esFechaCalendarioValida (Regla 1)', () => {
  it('acepta fechas reales de calendario', () => {
    expect(esFechaCalendarioValida('2026-02-28')).toBe(true);
    expect(esFechaCalendarioValida('2024-02-29')).toBe(true); // bisiesto
    expect(esFechaCalendarioValida('2026-07-15')).toBe(true);
    expect(esFechaCalendarioValida('2026-12-31')).toBe(true);
  });

  it('rechaza fechas imposibles', () => {
    expect(esFechaCalendarioValida('2026-02-30')).toBe(false);
    expect(esFechaCalendarioValida('2025-02-29')).toBe(false); // no bisiesto
    expect(esFechaCalendarioValida('2026-13-01')).toBe(false);
    expect(esFechaCalendarioValida('2026-00-10')).toBe(false);
    expect(esFechaCalendarioValida('2026-04-31')).toBe(false);
  });
});

describe('Regla 1 — schema rechaza fechas de calendario imposibles', () => {
  it('rechaza fechaFin 2026-02-30', () => {
    const paths = parsePaths({ ...base, fechaFin: '2026-02-30' });
    expect(paths).toContain('fechaFin');
  });

  it('rechaza fechaIngreso 2025-02-29 (no bisiesto)', () => {
    const paths = parsePaths({ ...base, fechaIngreso: '2025-02-29' });
    expect(paths).toContain('fechaIngreso');
  });

  it('rechaza segmento con fecha 2026-02-30', () => {
    const paths = parsePaths({
      ...base,
      segmentos: [{ fecha: '2026-02-30', tipo: 'extra_diurna', horas: 2 }],
    });
    expect(paths.some((p) => p.startsWith('segmentos.0'))).toBe(true);
  });

  it('acepta 2024-02-29 (bisiesto) en fechaIngreso', () => {
    const req = {
      ...base,
      fechaInicio: '2024-03-01',
      fechaFin: '2024-03-31',
      fechaIngreso: '2024-02-29',
    };
    expect(parseOk(req)).toBe(true);
  });
});

describe('Regla 2 — segmentos dentro del período', () => {
  it('rechaza segmento posterior a fechaFin con path indexado', () => {
    const paths = parsePaths({
      ...base,
      segmentos: [{ fecha: '2026-07-20', tipo: 'extra_diurna', horas: 2 }],
    });
    expect(paths).toContain('segmentos.0.fecha');
  });

  it('rechaza segmento anterior a fechaInicio', () => {
    const paths = parsePaths({
      ...base,
      segmentos: [{ fecha: '2026-06-30', tipo: 'asueto', horas: 8 }],
    });
    expect(paths).toContain('segmentos.0.fecha');
  });

  it('acepta segmentos en los bordes del período (inclusivo)', () => {
    const req = {
      ...base,
      segmentos: [
        { fecha: '2026-07-01', tipo: 'extra_diurna', horas: 2 },
        { fecha: '2026-07-15', tipo: 'asueto', horas: 8 },
      ],
    };
    expect(parseOk(req)).toBe(true);
  });
});

describe('Regla 3 — acumulado máximo 24 h por fecha', () => {
  it('rechaza 14h + 14h en la misma fecha', () => {
    const paths = parsePaths({
      ...base,
      segmentos: [
        { fecha: '2026-07-05', tipo: 'extra_diurna', horas: 14 },
        { fecha: '2026-07-05', tipo: 'extra_nocturna', horas: 14 },
      ],
    });
    expect(paths.some((p) => p.startsWith('segmentos.1'))).toBe(true);
  });

  it('acepta exactamente 24 h sumadas en una fecha', () => {
    const req = {
      ...base,
      segmentos: [
        { fecha: '2026-07-05', tipo: 'extra_diurna', horas: 16 },
        { fecha: '2026-07-05', tipo: 'extra_nocturna', horas: 8 },
      ],
    };
    expect(parseOk(req)).toBe(true);
  });

  it('las mismas horas en fechas distintas no cuentan como acumulado', () => {
    const req = {
      ...base,
      segmentos: [
        { fecha: '2026-07-05', tipo: 'extra_diurna', horas: 14 },
        { fecha: '2026-07-06', tipo: 'extra_diurna', horas: 14 },
      ],
    };
    expect(parseOk(req)).toBe(true);
  });
});

describe('Regla 4 — números finitos y no negativos', () => {
  it('rechaza horas = Infinity', () => {
    const paths = parsePaths({
      ...base,
      segmentos: [{ fecha: '2026-07-05', tipo: 'extra_diurna', horas: Infinity }],
    });
    expect(paths.length).toBeGreaterThan(0);
  });

  it('rechaza monto = Infinity', () => {
    const paths = parsePaths({
      ...base,
      incentivos: [{ id: 'i1', concepto: 'Bono', monto: Infinity, aplicaDescuentos: true }],
    });
    expect(paths.length).toBeGreaterThan(0);
  });

  it('rechaza salarioBase = Infinity', () => {
    expect(parseOk({ ...base, salarioBase: Infinity })).toBe(false);
  });

  it('rechaza NaN en horas', () => {
    const paths = parsePaths({
      ...base,
      segmentos: [{ fecha: '2026-07-05', tipo: 'extra_diurna', horas: NaN }],
    });
    expect(paths.length).toBeGreaterThan(0);
  });

  it('rechaza horas negativas', () => {
    const paths = parsePaths({
      ...base,
      segmentos: [{ fecha: '2026-07-05', tipo: 'extra_diurna', horas: -1 }],
    });
    expect(paths).toContain('segmentos.0.horas');
  });
});

describe('Regla 5 — máximo 31 días inclusivos', () => {
  it('acepta diferencia de 29 días (30 inclusivos)', () => {
    expect(validarNegocio({ ...base, fechaFin: '2026-07-30' })).toEqual([]);
  });

  it('acepta diferencia de 30 días (31 inclusivos)', () => {
    expect(validarNegocio({ ...base, fechaFin: '2026-07-31' })).toEqual([]);
  });

  it('rechaza diferencia de 31 días (32 inclusivos)', () => {
    const details = validarNegocio({ ...base, fechaFin: '2026-08-01' });
    expect(details).toHaveLength(1);
    expect(details[0]!.field).toBe('fechaFin');
    expect(details[0]!.message).toContain('31');
  });

  it('cruce de mes: 2026-01-31 a 2026-02-28 son 29 inclusivos (acepta)', () => {
    expect(validarNegocio({ ...base, fechaInicio: '2026-01-31', fechaFin: '2026-02-28' })).toEqual(
      [],
    );
  });
});

describe('Regla 6 — máximos de colecciones', () => {
  it('rechaza más de 100 segmentos', () => {
    const muchos = Array.from({ length: 101 }, (_, i) => ({
      fecha: `2026-07-${String((i % 15) + 1).padStart(2, '0')}`,
      tipo: 'extra_diurna' as const,
      horas: 0.1,
    }));
    const paths = parsePaths({ ...base, segmentos: muchos });
    expect(paths).toContain('segmentos');
  });

  it('acepta exactamente 100 segmentos (si el acumulado lo permite)', () => {
    const muchos = Array.from({ length: 100 }, (_, i) => ({
      fecha: `2026-07-${String((i % 15) + 1).padStart(2, '0')}`,
      tipo: 'extra_diurna' as const,
      horas: 0.1,
    }));
    expect(parseOk({ ...base, segmentos: muchos })).toBe(true);
  });

  it('rechaza más de 50 incentivos', () => {
    const muchos = Array.from({ length: 51 }, (_, i) => ({
      id: `i${i}`,
      concepto: 'Bono',
      monto: 1,
      aplicaDescuentos: true,
    }));
    const paths = parsePaths({ ...base, incentivos: muchos });
    expect(paths).toContain('incentivos');
  });

  it('rechaza incentivo con concepto vacío o > 100 caracteres', () => {
    const paths = parsePaths({
      ...base,
      incentivos: [{ id: 'i1', concepto: '', monto: 1, aplicaDescuentos: true }],
    });
    expect(paths).toContain('incentivos.0.concepto');

    const paths2 = parsePaths({
      ...base,
      incentivos: [{ id: 'i1', concepto: 'x'.repeat(101), monto: 1, aplicaDescuentos: true }],
    });
    expect(paths2).toContain('incentivos.0.concepto');
  });

  it('rechaza incentivo con id vacío', () => {
    const paths = parsePaths({
      ...base,
      incentivos: [{ id: '', concepto: 'Bono', monto: 1, aplicaDescuentos: true }],
    });
    expect(paths).toContain('incentivos.0.id');
  });
});

describe('Regla 7 — contrato sin horasBaseNocturnas', () => {
  it('rechaza request con horasBaseNocturnas (contrato estricto)', () => {
    const paths = parsePaths({ ...base, horasBaseNocturnas: 39 });
    expect(paths.length).toBeGreaterThan(0);
  });

  it('esFechaCalendarioValida rechaza formatos no ISO', () => {
    expect(esFechaCalendarioValida('01-07-2026')).toBe(false);
    expect(esFechaCalendarioValida('')).toBe(false);
  });
});

describe('resultado de parse mantiene defaults', () => {
  it('aplicaDescuentos default true al parsear', () => {
    const r = calcularRequestSchema.safeParse({
      ...base,
      incentivos: [{ id: 'i1', concepto: 'Bono', monto: 10 }],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.incentivos?.[0]?.aplicaDescuentos).toBe(true);
    }
  });
});
