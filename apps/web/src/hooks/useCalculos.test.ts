import { describe, it, expect } from 'vitest';
import { entradasASegmentos } from './useCalculos';
import type { EntradaPeriodo } from '@calc/shared';

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
});
