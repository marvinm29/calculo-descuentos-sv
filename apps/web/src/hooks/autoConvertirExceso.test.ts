import { describe, it, expect } from 'vitest';
import { autoConvertirExceso } from './useCalculos';
import type { JornadaConfig, SemanaRegistro } from '@calc/shared';

const semanaVacia: SemanaRegistro = {
  horasBaseNocturnas: 0,
  extraDiurna: 0,
  extraNocturna: 0,
  diaLibreDiurna: 0,
  diaLibreNocturna: 0,
  asueto: 0,
};

describe('autoConvertirExceso', () => {
  it('48h diurna personalizada, 1 semana → 4h exceso como extraDiurna', () => {
    const jornada: JornadaConfig = {
      tipo: 'personalizado',
      horasSemanales: 48,
      modalidad: 'diurna',
    };
    const semanas: SemanaRegistro[] = [{ ...semanaVacia }];

    const result = autoConvertirExceso(jornada, semanas);

    expect(result).toHaveLength(1);
    expect(result[0]!.extraDiurna).toBe(4);
    expect(result[0]!.extraNocturna).toBe(0);
  });

  it('42h nocturna personalizada, 1 semana → 3h exceso como extraNocturna', () => {
    const jornada: JornadaConfig = {
      tipo: 'personalizado',
      horasSemanales: 42,
      modalidad: 'nocturna',
    };
    const semanas: SemanaRegistro[] = [{ ...semanaVacia }];

    const result = autoConvertirExceso(jornada, semanas);

    expect(result).toHaveLength(1);
    expect(result[0]!.extraNocturna).toBe(3);
    expect(result[0]!.extraDiurna).toBe(0);
  });

  it('44h diurna — sin exceso', () => {
    const jornada: JornadaConfig = {
      tipo: 'tiempo_completo',
      horasSemanales: 44,
      modalidad: 'diurna',
    };
    const semanas: SemanaRegistro[] = [{ ...semanaVacia }];

    const result = autoConvertirExceso(jornada, semanas);

    expect(result[0]!.extraDiurna).toBe(0);
    expect(result[0]!.extraNocturna).toBe(0);
  });

  it('39h nocturna tiempo completo — sin exceso', () => {
    const jornada: JornadaConfig = {
      tipo: 'tiempo_completo',
      horasSemanales: 39,
      modalidad: 'nocturna',
    };
    const semanas: SemanaRegistro[] = [{ ...semanaVacia }];

    const result = autoConvertirExceso(jornada, semanas);

    expect(result[0]!.extraDiurna).toBe(0);
    expect(result[0]!.extraNocturna).toBe(0);
  });

  it('48h diurna, 2 semanas → CADA semana recibe 4h extra (total 8h)', () => {
    const jornada: JornadaConfig = {
      tipo: 'personalizado',
      horasSemanales: 48,
      modalidad: 'diurna',
    };
    const semanas: SemanaRegistro[] = [
      { ...semanaVacia },
      { ...semanaVacia },
    ];

    const result = autoConvertirExceso(jornada, semanas);

    expect(result).toHaveLength(2);
    expect(result[0]!.extraDiurna).toBe(4);
    expect(result[1]!.extraDiurna).toBe(4);
    expect(result[0]!.extraDiurna + result[1]!.extraDiurna).toBe(8);
  });

  it('semana vacia no modifica datos existentes', () => {
    const jornada: JornadaConfig = {
      tipo: 'personalizado',
      horasSemanales: 48,
      modalidad: 'diurna',
    };
    const semanas: SemanaRegistro[] = [
      { ...semanaVacia, extraDiurna: 2, horasBaseNocturnas: 5 },
    ];

    const result = autoConvertirExceso(jornada, semanas);

    expect(result[0]!.extraDiurna).toBe(6); // 2 existentes + 4 exceso
    expect(result[0]!.horasBaseNocturnas).toBe(5); // preservado
  });

  it('sin semanas → retorna array vacio', () => {
    const jornada: JornadaConfig = {
      tipo: 'personalizado',
      horasSemanales: 48,
      modalidad: 'diurna',
    };

    const result = autoConvertirExceso(jornada, []);

    expect(result).toEqual([]);
  });
});
