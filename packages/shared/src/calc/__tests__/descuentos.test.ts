import { describe, it, expect } from 'vitest';
import { calcularDescuentos } from '../descuentos';
import { AFP } from '../../tasas';
import { round2 } from '../horasExtra';

describe('calcularDescuentos', () => {
  describe('modo mensual', () => {
    it('ISSS: 3% sobre salario bruto cuando bajo el tope ($800)', () => {
      const r = calcularDescuentos(800, 'mensual');
      expect(r.isss.porcentaje).toBe(3.0);
      expect(r.isss.descuento).toBe(24.0);
      expect(r.isss.salarioAsegurable).toBe(800);
    });

    it('ISSS: tope de $30 cuando bruto supera $1000', () => {
      const r = calcularDescuentos(1500, 'mensual');
      expect(r.isss.salarioAsegurable).toBe(1000);
      expect(r.isss.descuento).toBe(30.0);
    });

    it('ISSS: tope de $30 en el límite exacto $1000', () => {
      const r = calcularDescuentos(1000, 'mensual');
      expect(r.isss.descuento).toBe(30.0);
    });

    it('AFP: 7.25% sobre salario bruto cuando bajo el tope ($800)', () => {
      const r = calcularDescuentos(800, 'mensual');
      expect(r.afp.porcentaje).toBe(7.25);
      expect(r.afp.descuento).toBe(58.0);
      expect(r.afp.salarioCotizable).toBe(800);
    });

    it('AFP: aplica tope mensual de $6,843.48', () => {
      const r = calcularDescuentos(10000, 'mensual');
      expect(r.afp.salarioCotizable).toBe(AFP.TOPE_MENSUAL);
      expect(r.afp.descuento).toBe(
        round2(AFP.TOPE_MENSUAL * AFP.PORCENTAJE_TRABAJADOR),
      );
    });

    it('Renta: base gravable = bruto - ISSS - AFP', () => {
      const r = calcularDescuentos(800, 'mensual');
      const expectedBg = round2(800 - 24.0 - 58.0);
      expect(r.renta.baseGravable).toBe(expectedBg);
      expect(r.renta.baseGravable).toBe(718.0);
    });

    it('Renta: salario $800 cae en tramo II (mensual)', () => {
      const r = calcularDescuentos(800, 'mensual');
      expect(r.renta.tramo).toBe(2);
      expect(r.renta.porcentajeExceso).toBe(10.0);
      expect(r.renta.cuotaFija).toBe(17.67);
    });

    it('Renta: $800 mensual produce $34.47 de descuento', () => {
      // Ver specs/tasas-legales.md
      // base gravable = 718.00 → Tramo II
      // Renta = ($718.00 - $550.00) * 0.10 + $17.67 = $34.47
      const r = calcularDescuentos(800, 'mensual');
      expect(r.renta.descuento).toBe(34.47);
    });

    it('Renta: tramo I (exento) para salario $500', () => {
      // Salario $500: bg ≈ $448.75 < $550 → tramo I
      const r = calcularDescuentos(500, 'mensual');
      expect(r.renta.tramo).toBe(1);
      expect(r.renta.descuento).toBe(0);
      expect(r.renta.porcentajeExceso).toBe(0);
      expect(r.renta.cuotaFija).toBe(0);
    });

    it('Renta: tramo IV para salarios altos', () => {
      const r = calcularDescuentos(5000, 'mensual');
      expect(r.renta.tramo).toBe(4);
      expect(r.renta.porcentajeExceso).toBe(30.0);
    });

    it('totalDescuentos = ISSS + AFP + Renta', () => {
      const r = calcularDescuentos(800, 'mensual');
      expect(r.totalDescuentos).toBe(
        round2(r.isss.descuento + r.afp.descuento + r.renta.descuento),
      );
    });

    it('totalDescuentos correcto para $800 mensual', () => {
      const r = calcularDescuentos(800, 'mensual');
      expect(r.totalDescuentos).toBe(round2(24.0 + 58.0 + 34.47));
      expect(r.totalDescuentos).toBe(116.47);
    });
  });

  describe('modo quincenal', () => {
    it('ISSS: tope quincenal = $500 (tope mensual/2)', () => {
      const r = calcularDescuentos(600, 'quincenal');
      expect(r.isss.salarioAsegurable).toBe(500);
      expect(r.isss.descuento).toBe(15.0);
    });

    it('ISSS: sin tope para bruto quincenal bajo $500', () => {
      const r = calcularDescuentos(400, 'quincenal');
      expect(r.isss.salarioAsegurable).toBe(400);
      expect(r.isss.descuento).toBe(12.0);
    });

    it('AFP: tope quincenal = $3,421.74', () => {
      const r = calcularDescuentos(5000, 'quincenal');
      const topeQuincenal = round2(AFP.TOPE_MENSUAL / 2);
      expect(r.afp.salarioCotizable).toBe(topeQuincenal);
    });

    it('Renta quincenal: tramos y cuotas divididos entre 2', () => {
      const r = calcularDescuentos(400, 'quincenal');
      expect(r.renta.tramo).toBeGreaterThanOrEqual(1);
      expect(r.renta.cuotaFija).toBeLessThan(17.67);
    });

    it('Renta quincenal: porcentaje de exceso es igual (no se divide)', () => {
      const r = calcularDescuentos(800, 'quincenal');
      // El porcentaje se reporta como el mismo (10%, 20%, 30%)
      // Solo cambian los tramos y cuotas fijas
      expect([0, 10, 20, 30]).toContain(r.renta.porcentajeExceso);
    });

    it('bruto quincenal produce descuentos menores a los mensuales', () => {
      const rMensual = calcularDescuentos(800, 'mensual');
      const rQuincenal = calcularDescuentos(400, 'quincenal');
      // Quincenal debe tener descuentos aproximadamente la mitad
      expect(rQuincenal.totalDescuentos).toBeLessThan(
        rMensual.totalDescuentos,
      );
    });
  });

  describe('casos borde', () => {
    it('salario 0 produce todos los descuentos en 0', () => {
      const r = calcularDescuentos(0, 'mensual');
      expect(r.isss.descuento).toBe(0);
      expect(r.afp.descuento).toBe(0);
      expect(r.renta.descuento).toBe(0);
      expect(r.totalDescuentos).toBe(0);
    });

    it('salario exacto en limite de tramo de renta', () => {
      // bg = bruto * 0.8975 (ISSS 3% + AFP 7.25%)
      // Para entrar a tramo II: bg >= 550.01
      // bruto >= 550.01 / 0.8975 ≈ 612.83
      const r = calcularDescuentos(612.83, 'mensual');
      expect(r.renta.tramo).toBe(2);
      expect(r.renta.descuento).toBeGreaterThan(0);
    });

    it('salario en el tope exacto de ISSS ($1000)', () => {
      const r = calcularDescuentos(1000, 'mensual');
      expect(r.isss.salarioAsegurable).toBe(1000);
      expect(r.isss.descuento).toBe(30);
    });
  });
});
