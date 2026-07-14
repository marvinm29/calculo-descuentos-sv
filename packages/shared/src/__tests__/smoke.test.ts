import { describe, it, expect } from 'vitest';
import {
  ISSS,
  AFP,
  RENTA_TRAMOS_MENSUAL,
  HORAS_EXTRA,
  AGUINALDO_DIAS,
  VACACIONES,
  QUINCENA_25,
  DIAS_ASUETO_FIJOS,
  calcularRequestSchema,
  validarNegocio,
} from '../index';

describe('packages/shared smoke', () => {
  describe('tasas.ts', () => {
    it('ISSS coincide con specs/tasas-legales.md', () => {
      expect(ISSS.PORCENTAJE_TRABAJADOR).toBe(0.03);
      expect(ISSS.TOPE_MENSUAL).toBe(1000.0);
      // El tope de $30 se deriva: 1000 * 0.03
      expect(ISSS.TOPE_MENSUAL * ISSS.PORCENTAJE_TRABAJADOR).toBe(30);
    });

    it('AFP coincide con specs/tasas-legales.md', () => {
      expect(AFP.PORCENTAJE_TRABAJADOR).toBe(0.0725);
      expect(AFP.TOPE_MENSUAL).toBe(6843.48);
    });

    it('Renta tiene 4 tramos mensuales', () => {
      expect(RENTA_TRAMOS_MENSUAL).toHaveLength(4);
      expect(RENTA_TRAMOS_MENSUAL[0].tramo).toBe(1);
      expect(RENTA_TRAMOS_MENSUAL[3].tramo).toBe(4);
      expect(RENTA_TRAMOS_MENSUAL[3].hasta).toBe(Number.POSITIVE_INFINITY);
    });

    it('factores de horas extra coinciden con Art. 168-173 CT', () => {
      expect(HORAS_EXTRA.EXTRA_DIURNA).toBe(2.0);
      expect(HORAS_EXTRA.EXTRA_NOCTURNA).toBe(2.25);
      expect(HORAS_EXTRA.DIA_LIBRE_DIURNA).toBe(1.5);
      expect(HORAS_EXTRA.DIA_LIBRE_NOCTURNA).toBe(1.75);
      expect(HORAS_EXTRA.ASUETO).toBe(2.0);
      expect(HORAS_EXTRA.NOCTURNIDAD).toBe(1.25);
    });

    it('aguinaldo: 15/15/19/21 dias por antiguedad', () => {
      expect(AGUINALDO_DIAS.MENOS_1).toBe(15);
      expect(AGUINALDO_DIAS.DE_1_A_3).toBe(15);
      expect(AGUINALDO_DIAS.DE_3_A_9).toBe(19);
      expect(AGUINALDO_DIAS.DE_10_O_MAS).toBe(21);
    });

    it('vacaciones: 15 dias, 30% bono', () => {
      expect(VACACIONES.DIAS_POR_ANO).toBe(15);
      expect(VACACIONES.BONO_PORCENTAJE).toBe(0.3);
    });

    it('Quincena 25: 50%, tope $1500', () => {
      expect(QUINCENA_25.PORCENTAJE).toBe(0.5);
      expect(QUINCENA_25.SALARIO_MAXIMO).toBe(1500.0);
    });

    it('dias de asueto fijos excluyen Semana Santa (variable)', () => {
      expect(DIAS_ASUETO_FIJOS.length).toBeGreaterThanOrEqual(8);
      expect(DIAS_ASUETO_FIJOS.map((d) => d.nombre)).not.toContain('Jueves Santo');
    });
  });

  describe('schemas.ts — ejemplo del api-contract.md', () => {
    it('parsea el request valido de $800 quincenal', () => {
      const req = {
        salarioBase: 800.0,
        tipoPago: 'quincenal' as const,
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-15',
        antiguedad: '3_a_9' as const,
        fechaIngreso: '2021-03-15',
        segmentos: [
          { fecha: '2026-07-01', tipo: 'regular_diurna' as const, horas: 8 },
          { fecha: '2026-07-01', tipo: 'extra_diurna' as const, horas: 2 },
          { fecha: '2026-07-02', tipo: 'regular_diurna' as const, horas: 8 },
          { fecha: '2026-07-06', tipo: 'dia_libre_diurna' as const, horas: 8 },
          { fecha: '2026-07-06', tipo: 'dia_libre_nocturna' as const, horas: 3 },
        ],
      };
      const parsed = calcularRequestSchema.parse(req);
      expect(parsed.salarioBase).toBe(800);
      expect(parsed.segmentos).toHaveLength(5);
    });

    it('rechaza salarioBase negativo con message y path', () => {
      const result = calcularRequestSchema.safeParse({
        salarioBase: -5,
        tipoPago: 'mensual',
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-15',
        antiguedad: '3_a_9',
        fechaIngreso: '2021-03-15',
        segmentos: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const field = result.error.issues[0]!.path[0];
        expect(field).toBe('salarioBase');
      }
    });

    it('rechaza horas fuera de [0,24]', () => {
      const result = calcularRequestSchema.safeParse({
        salarioBase: 800,
        tipoPago: 'mensual',
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-15',
        antiguedad: '3_a_9',
        fechaIngreso: '2021-03-15',
        segmentos: [{ fecha: '2026-07-02', tipo: 'regular_diurna', horas: 30 }],
      });
      expect(result.success).toBe(false);
    });

    it('rechaza fechaInicio > fechaFin', () => {
      const result = calcularRequestSchema.safeParse({
        salarioBase: 800,
        tipoPago: 'mensual',
        fechaInicio: '2026-07-20',
        fechaFin: '2026-07-15',
        antiguedad: '3_a_9',
        fechaIngreso: '2021-03-15',
        segmentos: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]!.path[0]).toBe('fechaInicio');
      }
    });

    it('validarNegocio detecta periodos > 31 dias', () => {
      const req = {
        salarioBase: 800,
        tipoPago: 'mensual' as const,
        fechaInicio: '2026-07-01',
        fechaFin: '2026-08-15', // 45 días
        antiguedad: '3_a_9' as const,
        fechaIngreso: '2021-03-15',
        segmentos: [],
      };
      const parsed = calcularRequestSchema.parse(req);
      const details = validarNegocio(parsed);
      expect(details).toHaveLength(1);
      expect(details[0]!.field).toBe('fechaFin');
    });

    it('validarNegocio pasa para periodo de 15 dias', () => {
      const req = {
        salarioBase: 800,
        tipoPago: 'quincenal' as const,
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-15',
        antiguedad: '3_a_9' as const,
        fechaIngreso: '2021-03-15',
        segmentos: [],
      };
      const parsed = calcularRequestSchema.parse(req);
      expect(validarNegocio(parsed)).toHaveLength(0);
    });
  });
});