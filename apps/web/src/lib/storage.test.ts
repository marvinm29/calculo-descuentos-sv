import { describe, it, expect, beforeEach, vi } from 'vitest';
import { entradasPeriodoSchema } from '@calc/shared';
import type { EntradaPeriodo } from '@calc/shared';
import {
  CLAVES_MUERTAS,
  limpiarClavesMuertas,
  parseador,
  registrarClavesDescartadas,
  tomarClavesDescartadas,
} from './storage';

const entradasValidas: EntradaPeriodo[] = [
  { id: 'e1', fecha: '2026-07-01', tipo: 'extra', horasDiurnas: 2, horasNocturnas: 0 },
];

describe('parseador (Regla 8 — persistencia validada)', () => {
  beforeEach(() => {
    tomarClavesDescartadas();
  });

  it('parsea JSON válido que cumple el schema', () => {
    const parse = parseador(entradasPeriodoSchema, [], 'entradas-periodo');
    expect(parse(JSON.stringify(entradasValidas))).toEqual(entradasValidas);
  });

  it('devuelve fallback y elimina la clave cuando el JSON es inválido', () => {
    localStorage.setItem('entradas-periodo', 'not-json');
    const parse = parseador(entradasPeriodoSchema, [], 'entradas-periodo');
    expect(parse(localStorage.getItem('entradas-periodo')!)).toEqual([]);
    expect(localStorage.getItem('entradas-periodo')).toBeNull();
  });

  it('devuelve fallback cuando la forma no coincide (cast manipulado)', () => {
    const manipulado = [{ id: 1, fecha: 'no-fecha', tipo: 'otro', horasDiurnas: 'x' }];
    const parse = parseador(entradasPeriodoSchema, [], 'entradas-periodo');
    expect(parse(JSON.stringify(manipulado))).toEqual([]);
  });

  it('devuelve fallback con NaN serializado (null en JSON)', () => {
    const parse = parseador(entradasPeriodoSchema, [], 'entradas-periodo');
    const corrupto = JSON.stringify([{ id: 'e1', fecha: '2026-07-01', tipo: 'extra', horasDiurnas: null, horasNocturnas: 0 }]);
    expect(parse(corrupto)).toEqual([]);
  });

  it('registra la clave descartada para feedback de UI', () => {
    const collector = vi.fn();
    const parse = parseador(entradasPeriodoSchema, [], 'entradas-periodo', collector);
    parse(JSON.stringify({ nope: true }));
    expect(collector).toHaveBeenCalledWith('entradas-periodo');
  });

  it('aplica defaults del schema al parsear', () => {
    const parse = parseador(entradasPeriodoSchema, [], 'entradas-periodo');
    expect(parse(JSON.stringify(entradasValidas))).toEqual(entradasValidas);
  });
});

describe('limpiarClavesMuertas (migración de limpieza)', () => {
  beforeEach(() => {
    localStorage.clear();
    tomarClavesDescartadas();
  });

  it('elimina las claves muertas del modelo semanal viejo', () => {
    localStorage.setItem('registro-periodo', '[1,2,3]');
    localStorage.setItem('registro-semanal', '[]');
    localStorage.setItem('entradas-periodo', '[]');
    limpiarClavesMuertas();
    expect(localStorage.getItem('registro-periodo')).toBeNull();
    expect(localStorage.getItem('registro-semanal')).toBeNull();
    expect(localStorage.getItem('entradas-periodo')).toBe('[]');
  });

  it('no falla si las claves muertas no existen', () => {
    expect(() => limpiarClavesMuertas()).not.toThrow();
  });

  it('CLAVES_MUERTAS contiene exactamente las claves del modelo muerto', () => {
    expect(CLAVES_MUERTAS).toEqual(['registro-periodo', 'registro-semanal']);
  });
});

describe('collector global de claves descartadas', () => {
  beforeEach(() => {
    localStorage.clear();
    tomarClavesDescartadas();
  });

  it('tomarClavesDescartadas drena el registro', () => {
    registrarClavesDescartadas('a');
    registrarClavesDescartadas('b');
    expect(tomarClavesDescartadas()).toEqual(['a', 'b']);
    expect(tomarClavesDescartadas()).toEqual([]);
  });

  it('no duplica claves', () => {
    registrarClavesDescartadas('x');
    registrarClavesDescartadas('x');
    expect(tomarClavesDescartadas()).toEqual(['x']);
  });
});
