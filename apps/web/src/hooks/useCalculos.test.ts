import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { entradasASegmentos, incentivosValidos, useCalculos } from './useCalculos';
import { AppProvider } from '../context/AppContext';
import type { EntradaPeriodo, Incentivo } from '@calc/shared';

describe('entradasASegmentos', () => {
  it('retorna array vacio cuando no hay entradas', () => {
    expect(entradasASegmentos([])).toEqual([]);
  });

  it('convierte entrada extra diurna en segmento extra_diurna', () => {
    const entrada: EntradaPeriodo = {
      id: '1',
      fecha: '2026-07-01',
      tipo: 'extra',
      horasDiurnas: 3,
      horasNocturnas: 0,
    };
    expect(entradasASegmentos([entrada])).toEqual([
      { fecha: '2026-07-01', tipo: 'extra_diurna', horas: 3 },
    ]);
  });

  it('convierte entrada extra nocturna en segmento extra_nocturna', () => {
    const entrada: EntradaPeriodo = {
      id: '1',
      fecha: '2026-07-01',
      tipo: 'extra',
      horasDiurnas: 0,
      horasNocturnas: 2,
    };
    expect(entradasASegmentos([entrada])).toEqual([
      { fecha: '2026-07-01', tipo: 'extra_nocturna', horas: 2 },
    ]);
  });

  it('convierte entrada dia_libre diurna en segmento dia_libre_diurna', () => {
    const entrada: EntradaPeriodo = {
      id: '1',
      fecha: '2026-07-05',
      tipo: 'dia_libre',
      horasDiurnas: 8,
      horasNocturnas: 0,
    };
    expect(entradasASegmentos([entrada])).toEqual([
      { fecha: '2026-07-05', tipo: 'dia_libre_diurna', horas: 8 },
    ]);
  });

  it('convierte entrada dia_libre nocturna en segmento dia_libre_nocturna', () => {
    const entrada: EntradaPeriodo = {
      id: '1',
      fecha: '2026-07-05',
      tipo: 'dia_libre',
      horasDiurnas: 0,
      horasNocturnas: 4,
    };
    expect(entradasASegmentos([entrada])).toEqual([
      { fecha: '2026-07-05', tipo: 'dia_libre_nocturna', horas: 4 },
    ]);
  });

  it('convierte entrada asueto sumando diurnas + nocturnas', () => {
    const entrada: EntradaPeriodo = {
      id: '1',
      fecha: '2026-07-01',
      tipo: 'asueto',
      horasDiurnas: 6,
      horasNocturnas: 2,
    };
    expect(entradasASegmentos([entrada])).toEqual([
      { fecha: '2026-07-01', tipo: 'asueto', horas: 8 },
    ]);
  });

  it('salta entradas con 0 horas', () => {
    const entrada: EntradaPeriodo = {
      id: '1',
      fecha: '2026-07-01',
      tipo: 'extra',
      horasDiurnas: 0,
      horasNocturnas: 0,
    };
    expect(entradasASegmentos([entrada])).toEqual([]);
  });

  it('convierte entrada con diurnas y nocturnas en dos segmentos separados', () => {
    const entrada: EntradaPeriodo = {
      id: '1',
      fecha: '2026-07-01',
      tipo: 'extra',
      horasDiurnas: 2,
      horasNocturnas: 3,
    };
    const segmentos = entradasASegmentos([entrada]);
    expect(segmentos).toHaveLength(2);
    expect(segmentos).toContainEqual({
      fecha: '2026-07-01',
      tipo: 'extra_diurna',
      horas: 2,
    });
    expect(segmentos).toContainEqual({
      fecha: '2026-07-01',
      tipo: 'extra_nocturna',
      horas: 3,
    });
  });

  it('no genera segmentos regulares ni recargo inferido (Regla 7 integridad)', () => {
    const entradas: EntradaPeriodo[] = [
      { id: '1', fecha: '2026-07-01', tipo: 'extra', horasDiurnas: 2, horasNocturnas: 0 },
      { id: '2', fecha: '2026-07-02', tipo: 'extra', horasDiurnas: 0, horasNocturnas: 3 },
    ];
    const tipos = entradasASegmentos(entradas).map((s) => s.tipo);
    expect(tipos).not.toContain('regular_diurna');
    expect(tipos).not.toContain('regular_nocturna');
    expect(tipos).toEqual(['extra_diurna', 'extra_nocturna']);
  });

  // ─── Regla 4 en cliente (2026-09-20): horas no finitas/negativas/fuera de
  // rango no alimentan el cálculo (mismo criterio que fecha inválida). ───
  describe('filas con horas inválidas no alimentan el cálculo (Regla 4 en cliente)', () => {
    it('descarta NaN, Infinity, -Infinity y negativos', () => {
      const entradas: EntradaPeriodo[] = [
        { id: '1', fecha: '2026-07-01', tipo: 'extra', horasDiurnas: NaN, horasNocturnas: 0 },
        { id: '2', fecha: '2026-07-02', tipo: 'extra', horasDiurnas: Infinity, horasNocturnas: 0 },
        { id: '3', fecha: '2026-07-03', tipo: 'extra', horasDiurnas: -1, horasNocturnas: 0 },
        { id: '4', fecha: '2026-07-04', tipo: 'extra', horasDiurnas: 25, horasNocturnas: 0 },
        { id: '5', fecha: '2026-07-05', tipo: 'extra', horasDiurnas: 2, horasNocturnas: 0 },
      ];
      expect(entradasASegmentos(entradas)).toEqual([
        { fecha: '2026-07-05', tipo: 'extra_diurna', horas: 2 },
      ]);
    });
  });
});

// ─── Derivación del periodo (FE-01) ───
// La zona se fija para que `hoy` no dependa del TZ del host.
const TZ_ORIGINAL = process.env.TZ;

describe('useCalculos: derivación del periodo (FE-01)', () => {
  beforeAll(() => {
    process.env.TZ = 'America/El_Salvador';
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-20T12:00:00-06:00'));
  });

  afterAll(() => {
    if (TZ_ORIGINAL === undefined) delete process.env.TZ;
    else process.env.TZ = TZ_ORIGINAL;
    vi.useRealTimers();
  });

  function seedStorage(
    entradas: unknown[],
    fechaIngreso = '2026-08-01',
  ): void {
    localStorage.setItem(
      'config-inicial',
      JSON.stringify({
        salarioBase: 800,
        tipoPago: 'mensual',
        antiguedad: '1_a_3',
        fechaIngreso,
      }),
    );
    localStorage.setItem('entradas-periodo', JSON.stringify(entradas));
  }

  function calcularPeriodo() {
    const { result } = renderHook(() => useCalculos(), {
      wrapper: AppProvider,
    });
    return result.current;
  }

  it('no mezcla `hoy` con una fecha histórica', () => {
    seedStorage([
      { id: 'e1', fecha: '2026-09-01', tipo: 'extra', horasDiurnas: 2, horasNocturnas: 0 },
    ]);
    const estado = calcularPeriodo();
    if (estado.status !== 'success') {
      throw new Error(`se esperaba success, fue: ${estado.status}`);
    }
    expect(estado.request.fechaInicio).toBe('2026-09-01');
    expect(estado.request.fechaFin).toBe('2026-09-01'); // NO 2026-09-20 (hoy)
  });

  it('deriva min..max exclusivamente de las fechas capturadas', () => {
    seedStorage([
      { id: 'e1', fecha: '2026-09-01', tipo: 'extra', horasDiurnas: 2, horasNocturnas: 0 },
      { id: 'e2', fecha: '2026-09-15', tipo: 'extra', horasDiurnas: 1, horasNocturnas: 0 },
    ]);
    const estado = calcularPeriodo();
    if (estado.status !== 'success') {
      throw new Error(`se esperaba success, fue: ${estado.status}`);
    }
    expect(estado.request.fechaInicio).toBe('2026-09-01');
    expect(estado.request.fechaFin).toBe('2026-09-15');
  });

  it('sin fechas capturadas usa hoy local en ambos extremos', () => {
    seedStorage([]);
    const estado = calcularPeriodo();
    if (estado.status !== 'success') {
      throw new Error(`se esperaba success, fue: ${estado.status}`);
    }
    expect(estado.request.fechaInicio).toBe('2026-09-20');
    expect(estado.request.fechaFin).toBe('2026-09-20');
  });

  it('descarta fechas imposibles y usa hoy local como periodo', () => {
    seedStorage([
      { id: 'e1', fecha: '2026-02-30', tipo: 'extra', horasDiurnas: 2, horasNocturnas: 0 },
    ]);
    const estado = calcularPeriodo();
    if (estado.status !== 'success') {
      throw new Error(`se esperaba success, fue: ${estado.status}`);
    }
    expect(estado.request.fechaInicio).toBe('2026-09-20');
    expect(estado.request.fechaFin).toBe('2026-09-20');
    expect(estado.request.segmentos).toEqual([]);
  });

  // ─── Periodo histórico exige fecha de ingreso (2026-09-20) ───
  it('periodo histórico sin fechaIngreso produce error accionable, no sustituye por hoy', () => {
    seedStorage(
      [
        { id: 'e1', fecha: '2026-09-01', tipo: 'extra', horasDiurnas: 2, horasNocturnas: 0 },
      ],
      '', // fechaIngreso vacía
    );
    const estado = calcularPeriodo();
    expect(estado.status).toBe('error');
    if (estado.status === 'error') {
      // Mensaje accionable que nombra el campo y la sección, no el genérico
      // del schema ("Fecha de ingreso no puede ser posterior al periodo").
      expect(estado.error).toMatch(/fecha de ingreso/i);
      expect(estado.error).toMatch(/configuración/i);
      expect(estado.error).not.toMatch(/posterior al periodo/);
    }
  });

  it('periodo actual (hoy) sin fechaIngreso sigue calculando', () => {
    seedStorage([], '');
    const estado = calcularPeriodo();
    expect(estado.status).toBe('success');
  });

  it('incentivos con monto no finito o negativo no alimentan el cálculo', () => {
    // Nota: JSON no puede serializar Infinity (queda null y el parser de
    // localStorage descarta la clave completa, Regla 8). El camino real de un
    // monto no finito es el estado en memoria durante la sesión (el usuario
    // escribe '1e999'), así que se verifica sobre incentivosValidos.
    const fila = (over: Partial<Incentivo>): Incentivo => ({
      id: 'i',
      concepto: 'Bono',
      monto: 10,
      aplicaDescuentos: true,
      ...over,
    });
    expect(
      incentivosValidos([
        fila({ id: 'a', monto: Infinity }),
        fila({ id: 'b', monto: -Infinity }),
        fila({ id: 'c', monto: NaN }),
        fila({ id: 'd', monto: -5 }),
        fila({ id: 'e', concepto: 'x'.repeat(101) }),
        fila({ id: 'f', monto: 50 }),
      ]).map((i) => i.id),
    ).toEqual(['f']);
  });
});
