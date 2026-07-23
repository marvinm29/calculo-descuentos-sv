import { describe, it, expect } from 'vitest';
import { entradasASegmentos } from './useCalculos';
import type { EntradaPeriodo, JornadaConfig } from '@calc/shared';

const diurna: JornadaConfig = {
  tipo: 'tiempo_completo',
  horasSemanales: 44,
  modalidad: 'diurna',
};

const nocturna: JornadaConfig = {
  tipo: 'tiempo_completo',
  horasSemanales: 39,
  modalidad: 'nocturna',
};

describe('entradasASegmentos', () => {
  it('retorna arrays vacios cuando no hay entradas', () => {
    const r = entradasASegmentos([], diurna);
    expect(r.segmentos).toEqual([]);
    expect(r.horasBaseNocturnas).toBe(0);
  });

  it('convierte entrada extra diurna en segmento extra_diurna', () => {
    const entrada: EntradaPeriodo = {
      id: '1',
      fecha: '2026-07-01',
      tipo: 'extra',
      horasDiurnas: 3,
      horasNocturnas: 0,
    };
    const r = entradasASegmentos([entrada], diurna);
    expect(r.segmentos).toEqual([
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
    const r = entradasASegmentos([entrada], diurna);
    expect(r.segmentos).toEqual([
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
    const r = entradasASegmentos([entrada], diurna);
    expect(r.segmentos).toEqual([
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
    const r = entradasASegmentos([entrada], diurna);
    expect(r.segmentos).toEqual([
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
    const r = entradasASegmentos([entrada], diurna);
    expect(r.segmentos).toEqual([
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
    const r = entradasASegmentos([entrada], diurna);
    expect(r.segmentos).toEqual([]);
  });

  it('convierte entrada con diurnas y nocturnas en dos segmentos separados', () => {
    const entrada: EntradaPeriodo = {
      id: '1',
      fecha: '2026-07-01',
      tipo: 'extra',
      horasDiurnas: 2,
      horasNocturnas: 3,
    };
    const r = entradasASegmentos([entrada], diurna);
    expect(r.segmentos).toHaveLength(2);
    expect(r.segmentos).toContainEqual({
      fecha: '2026-07-01',
      tipo: 'extra_diurna',
      horas: 2,
    });
    expect(r.segmentos).toContainEqual({
      fecha: '2026-07-01',
      tipo: 'extra_nocturna',
      horas: 3,
    });
  });

  describe('horasBaseNocturnas', () => {
    it('es 0 cuando modalidad es diurna', () => {
      const entrada: EntradaPeriodo = {
        id: '1',
        fecha: '2026-07-01',
        tipo: 'extra',
        horasDiurnas: 2,
        horasNocturnas: 0,
      };
      const r = entradasASegmentos([entrada], diurna);
      expect(r.horasBaseNocturnas).toBe(0);
    });

    it('deriva 7h por fecha unica cuando modalidad es nocturna', () => {
      const entrada: EntradaPeriodo = {
        id: '1',
        fecha: '2026-07-01',
        tipo: 'extra',
        horasDiurnas: 2,
        horasNocturnas: 0,
      };
      const r = entradasASegmentos([entrada], nocturna);
      expect(r.horasBaseNocturnas).toBe(7);
    });

    it('cuenta fechas unicas × 7 para nocturna con multiples fechas', () => {
      const entradas: EntradaPeriodo[] = [
        { id: '1', fecha: '2026-07-01', tipo: 'extra', horasDiurnas: 2, horasNocturnas: 0 },
        { id: '2', fecha: '2026-07-02', tipo: 'extra', horasDiurnas: 0, horasNocturnas: 3 },
        { id: '3', fecha: '2026-07-01', tipo: 'asueto', horasDiurnas: 8, horasNocturnas: 0 },
      ];
      const r = entradasASegmentos(entradas, nocturna);
      expect(r.horasBaseNocturnas).toBe(14); // 2 fechas unicas × 7
    });
  });
});
