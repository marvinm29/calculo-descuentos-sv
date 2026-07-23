import { describe, it, expect, beforeEach } from 'vitest';
import { migrarRegistroViejo } from '../lib/migrarRegistro';

const VIEJO_KEY = 'registro-semanal';

describe('migrarRegistroViejo', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('key ausente → []', () => {
    expect(migrarRegistroViejo()).toEqual([]);
  });

  it('JSON corrupto → [] y borra key', () => {
    localStorage.setItem(VIEJO_KEY, 'not-json');
    const result = migrarRegistroViejo();
    expect(result).toEqual([]);
    expect(localStorage.getItem(VIEJO_KEY)).toBeNull();
  });

  it('recupera extra_diurna y extra_nocturna del modelo viejo', () => {
    const viejo = {
      '2026-07-06': [
        {
          fecha: '2026-07-06',
          jornadaBase: 'regular_diurna',
          bloques: [
            { id: 'b1', inicio: '08:00', fin: '18:00', tipo: 'extra_diurna' },
            { id: 'b2', inicio: '18:00', fin: '21:00', tipo: 'extra_nocturna' },
          ],
        },
      ],
    };
    localStorage.setItem(VIEJO_KEY, JSON.stringify(viejo));
    const result = migrarRegistroViejo();
    expect(result).toHaveLength(1);
    expect(result[0]!.extraDiurna).toBeCloseTo(10, 2);
    expect(result[0]!.extraNocturna).toBeCloseTo(3, 2);
    expect(result[0]!.horasBaseNocturnas).toBe(0);
    expect(localStorage.getItem(VIEJO_KEY)).toBeNull();
  });

  it('bloques extra raros maneja correctamente cruce de medianoche', () => {
    // Cruce de medianoche (bug #2 del audit): fin <= inicio → 0h
    const viejo = {
      'sem1': [
        {
          fecha: '2026-07-06',
          jornadaBase: 'regular_nocturna',
          bloques: [
            { id: 'b1', inicio: '22:00', fin: '02:00', tipo: 'extra_nocturna' },
          ],
        },
      ],
    };
    localStorage.setItem(VIEJO_KEY, JSON.stringify(viejo));
    const result = migrarRegistroViejo();
    expect(result).toHaveLength(1);
    // Cruce de medianoche: fin (2:00) <= inicio (22:00) → 0h
    expect(result[0]!.extraNocturna).toBe(0);
  });

  it('valor vacio → []', () => {
    localStorage.setItem(VIEJO_KEY, JSON.stringify({}));
    expect(migrarRegistroViejo()).toEqual([]);
  });

  it('rescata horasBaseNocturnas de bloques base en jornada nocturna', () => {
    const viejo = {
      '2026-07-06': [
        {
          fecha: '2026-07-06',
          jornadaBase: 'regular_nocturna',
          bloques: [
            { id: 'b1', inicio: '19:00', fin: '21:00', tipo: 'base' },
            { id: 'b2', inicio: '21:00', fin: '22:00', tipo: 'extra_nocturna' },
          ],
        },
      ],
    };
    localStorage.setItem(VIEJO_KEY, JSON.stringify(viejo));
    const result = migrarRegistroViejo();
    expect(result).toHaveLength(1);
    expect(result[0]!.horasBaseNocturnas).toBeCloseTo(2, 2);
    expect(result[0]!.extraNocturna).toBeCloseTo(1, 2);
  });

  it('jornada diurna con bloques base NO se rescatan como nocturnas', () => {
    const viejo = {
      '2026-07-06': [
        {
          fecha: '2026-07-06',
          jornadaBase: 'regular_diurna',
          bloques: [
            { id: 'b1', inicio: '08:00', fin: '17:00', tipo: 'base' },
          ],
        },
      ],
    };
    localStorage.setItem(VIEJO_KEY, JSON.stringify(viejo));
    const result = migrarRegistroViejo();
    expect(result).toHaveLength(1);
    expect(result[0]!.horasBaseNocturnas).toBe(0);
  });
});
