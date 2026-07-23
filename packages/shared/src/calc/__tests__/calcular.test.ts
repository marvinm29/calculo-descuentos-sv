import { describe, it, expect } from 'vitest';
import { calcular } from '../calcular';
import type { CalcularRequest } from '../../types';
import { round2 } from '../horasExtra';

const requestQuincenal800: CalcularRequest = {
  salarioBase: 800.0,
  tipoPago: 'quincenal',
  fechaInicio: '2026-07-01',
  fechaFin: '2026-07-15',
  antiguedad: '3_a_9',
  fechaIngreso: '2021-03-15',
  segmentos: [
    { fecha: '2026-07-01', tipo: 'regular_diurna', horas: 8 },
    { fecha: '2026-07-01', tipo: 'extra_diurna', horas: 2 },
    { fecha: '2026-07-02', tipo: 'regular_diurna', horas: 8 },
    { fecha: '2026-07-06', tipo: 'dia_libre_diurna', horas: 8 },
    { fecha: '2026-07-06', tipo: 'dia_libre_nocturna', horas: 3 },
  ],
};

const requestMensual800: CalcularRequest = {
  salarioBase: 800.0,
  tipoPago: 'mensual',
  fechaInicio: '2026-07-01',
  fechaFin: '2026-07-31',
  antiguedad: '1_a_3',
  fechaIngreso: '2025-01-15',
  segmentos: [
    { fecha: '2026-07-01', tipo: 'regular_diurna', horas: 8 },
    { fecha: '2026-07-03', tipo: 'extra_diurna', horas: 3 },
  ],
};

describe('calcular', () => {
  describe('modo quincenal — fixture api-contract.md ($800, 3_a_9)', () => {
    const result = calcular(requestQuincenal800);

    it('produce la estructura completa de CalcularResponse', () => {
      expect(result.bruto).toBeDefined();
      expect(result.descuentos).toBeDefined();
      expect(result.prestaciones).toBeDefined();
      expect(result.neto).toBeDefined();
    });

    it('bruto.salarioBase = $400 (mitad del mensual $800)', () => {
      expect(result.bruto.salarioBase).toBe(400.0);
    });

    it('bruto incluye pagos por horas extra correctos', () => {
      const hora = 800 / 30 / 8;
      expect(result.bruto.horasExtraDiurna).toBe(
        round2(hora * 2.0 * 2),
      );
      expect(result.bruto.diaLibreDiurna).toBe(round2(hora * 1.5 * 8));
      expect(result.bruto.diaLibreNocturna).toBe(
        round2(hora * 1.75 * 3),
      );
      expect(result.bruto.horasExtraNocturna).toBe(0);
      expect(result.bruto.asueto).toBe(0);
    });

    it('bruto.brutoTotal = salarioBase + suma de extras', () => {
      const { bruto } = result;
      const sumExtras =
        bruto.horasExtraDiurna +
        bruto.horasExtraNocturna +
        bruto.diaLibreDiurna +
        bruto.diaLibreNocturna +
        bruto.asueto;
      expect(bruto.brutoTotal).toBe(round2(bruto.salarioBase + sumExtras));
    });

    it('ISSS: 3% sobre salario asegurable quincenal', () => {
      expect(result.descuentos.isss.porcentaje).toBe(3.0);
      expect(result.descuentos.isss.descuento).toBeGreaterThan(0);
    });

    it('AFP: 7.25% sobre salario cotizable quincenal', () => {
      expect(result.descuentos.afp.porcentaje).toBe(7.25);
      expect(result.descuentos.afp.descuento).toBeGreaterThan(0);
    });

    it('Renta: usa tramos quincenales (divididos /2)', () => {
      const { renta } = result.descuentos;
      expect(renta.tramo).toBeGreaterThanOrEqual(1);
      expect(renta.baseGravable).toBeGreaterThan(0);
      expect(renta.descuento).toBeGreaterThan(0);
    });

    it('totalDescuentos = ISSS + AFP + Renta', () => {
      const d = result.descuentos;
      expect(d.totalDescuentos).toBe(
        round2(d.isss.descuento + d.afp.descuento + d.renta.descuento),
      );
    });

    it('aguinaldo: 19 días para antiguedad 3_a_9', () => {
      expect(result.prestaciones.aguinaldo).not.toBeNull();
      expect(result.prestaciones.aguinaldo!.dias).toBe(19);
      expect(result.prestaciones.aguinaldo!.proporcional).toBe(false);
    });

    it('aguinaldo: monto = 19 * salarioDiario', () => {
      const salarioDiario = 800 / 30;
      const expected = round2(19 * salarioDiario);
      expect(result.prestaciones.aguinaldo!.monto).toBe(expected);
    });

    it('vacaciones: 30% de 15 dias', () => {
      expect(result.prestaciones.vacaciones).not.toBeNull();
      expect(result.prestaciones.vacaciones!.porcentaje).toBe(30.0);
      expect(result.prestaciones.vacaciones!.monto).toBe(120.0);
    });

    it('quincena25: aplica porque salario $800 ≤ $1500', () => {
      expect(result.prestaciones.quincena25).not.toBeNull();
      expect(result.prestaciones.quincena25!.porcentaje).toBe(50.0);
      expect(result.prestaciones.quincena25!.monto).toBe(400.0);
    });

    it('neto.salarioLiquido = brutoTotal - totalDescuentos', () => {
      expect(result.neto.salarioLiquido).toBe(
        round2(
          result.bruto.brutoTotal -
            result.descuentos.totalDescuentos,
        ),
      );
    });

    it('neto es positivo y menor al bruto', () => {
      expect(result.neto.salarioLiquido).toBeGreaterThan(0);
      expect(result.neto.salarioLiquido).toBeLessThan(
        result.bruto.brutoTotal,
      );
    });
  });

  describe('modo mensual — salario $800, 1_a_3 años', () => {
    const result = calcular(requestMensual800);

    it('salarioBase completo ($800) para tipo mensual', () => {
      expect(result.bruto.salarioBase).toBe(800);
    });

    it('brutoTotal > salarioBase por horas extra', () => {
      expect(result.bruto.brutoTotal).toBeGreaterThan(
        result.bruto.salarioBase,
      );
    });

    it('ISSS: 3% sobre bruto con extras para $800 mensual', () => {
      expect(result.descuentos.isss.porcentaje).toBe(3.0);
      expect(result.descuentos.isss.descuento).toBe(
        round2(result.bruto.brutoTotal * 0.03),
      );
    });

    it('AFP: $58 para $800 mensual (aprox, depende de extras)', () => {
      const expectedAfp = round2(
        result.bruto.brutoTotal * 0.0725,
      );
      expect(result.descuentos.afp.descuento).toBe(expectedAfp);
    });

    it('Renta: tramo II para base gravable ~$718 (sin extras)', () => {
      // Con pocas extras, base gravable debe caer en tramo II mensual
      expect(result.descuentos.renta.tramo).toBeGreaterThanOrEqual(2);
    });

    it('aguinaldo: 15 días para 1_a_3 años', () => {
      expect(result.prestaciones.aguinaldo!.dias).toBe(15);
    });

    it('neto > 0', () => {
      expect(result.neto.salarioLiquido).toBeGreaterThan(0);
    });
  });

  describe('consistencia interna', () => {
    it('neto nunca es negativo', () => {
      const cases: CalcularRequest[] = [
        {
          ...requestQuincenal800,
          salarioBase: 300,
          segmentos: [],
        },
        {
          ...requestMensual800,
          salarioBase: 400,
          segmentos: [],
        },
        {
          ...requestQuincenal800,
          salarioBase: 10000,
          segmentos: [
            ...requestQuincenal800.segmentos,
            { fecha: '2026-07-07', tipo: 'extra_nocturna', horas: 8 },
          ],
        },
      ];

      for (const req of cases) {
        const res = calcular(req);
        expect(res.neto.salarioLiquido).toBeGreaterThanOrEqual(0);
      }
    });

    it('brutoTotal y totalDescuentos son valores monetarios con max 2 decimales', () => {
      const result = calcular(requestQuincenal800);
      const brutoStr = result.bruto.brutoTotal.toString();
      const descStr = result.descuentos.totalDescuentos.toString();
      const netoStr = result.neto.salarioLiquido.toString();

      for (const str of [brutoStr, descStr, netoStr]) {
        const decimals = str.includes('.')
          ? str.split('.')[1]!.length
          : 0;
        expect(decimals).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('recargo nocturnidad (Sprint 10)', () => {
    it('39h base nocturnas salario $800 → recargo ≈ $32.50', () => {
      const horaDiurna = 800 / 30 / 8;
      const esperado = round2(39 * horaDiurna * 0.25);
      const result = calcular({
        salarioBase: 800,
        tipoPago: 'mensual',
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-31',
        antiguedad: '1_a_3',
        fechaIngreso: '2025-01-15',
        segmentos: [],
        horasBaseNocturnas: 39,
      });
      expect(result.bruto.recargoNocturnidad).toBe(esperado);
    });

    it('0 horas base nocturnas → recargo 0', () => {
      const result = calcular({
        salarioBase: 800,
        tipoPago: 'mensual',
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-31',
        antiguedad: '1_a_3',
        fechaIngreso: '2025-01-15',
        segmentos: [],
        horasBaseNocturnas: 0,
      });
      expect(result.bruto.recargoNocturnidad).toBe(0);
    });

    it('sin campo horasBaseNocturnas → recargo 0 (backward compat)', () => {
      const result = calcular({
        salarioBase: 800,
        tipoPago: 'mensual',
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-31',
        antiguedad: '1_a_3',
        fechaIngreso: '2025-01-15',
        segmentos: [],
      });
      expect(result.bruto.recargoNocturnidad).toBe(0);
    });
  });

  describe('incentivos (Sprint 10)', () => {
    it('incentivo gravado → descuentos aumentan, neto < brutoTotal', () => {
      const result = calcular({
        salarioBase: 800,
        tipoPago: 'mensual',
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-31',
        antiguedad: '1_a_3',
        fechaIngreso: '2025-01-15',
        segmentos: [],
        incentivos: [
          { id: '1', concepto: 'Bono', monto: 200, aplicaDescuentos: true },
        ],
      });
      expect(result.bruto.incentivos).toBe(200);
      expect(result.bruto.incentivosGravados).toBe(200);
      expect(result.bruto.brutoTotal).toBe(1000);
      expect(result.descuentos.totalDescuentos).toBeGreaterThan(0);
    });

    it('incentivo mixto: gravado + no gravado', () => {
      const result = calcular({
        salarioBase: 800,
        tipoPago: 'mensual',
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-31',
        antiguedad: '1_a_3',
        fechaIngreso: '2025-01-15',
        segmentos: [],
        incentivos: [
          { id: '1', concepto: 'Bono', monto: 100, aplicaDescuentos: true },
          { id: '2', concepto: 'Regalo', monto: 50, aplicaDescuentos: false },
        ],
      });
      expect(result.bruto.incentivos).toBe(150);
      expect(result.bruto.incentivosGravados).toBe(100);
      expect(result.bruto.brutoTotal).toBe(950);
    });

    it('sin incentivos → campos en 0', () => {
      const result = calcular({
        salarioBase: 800,
        tipoPago: 'mensual',
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-31',
        antiguedad: '1_a_3',
        fechaIngreso: '2025-01-15',
        segmentos: [],
      });
      expect(result.bruto.incentivos).toBe(0);
      expect(result.bruto.incentivosGravados).toBe(0);
    });
  });

  describe('1h extra sola (Sprint 10 — sin mínimo)', () => {
    it('1h extra diurna sola se calcula correctamente', () => {
      const horaDiurna = 800 / 30 / 8;
      const result = calcular({
        salarioBase: 800,
        tipoPago: 'mensual',
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-31',
        antiguedad: '1_a_3',
        fechaIngreso: '2025-01-15',
        segmentos: [
          { fecha: '2026-07-01', tipo: 'extra_diurna', horas: 1 },
        ],
      });
      expect(result.bruto.horasExtraDiurna).toBe(
        round2(horaDiurna * 2.0 * 1),
      );
      expect(result.bruto.brutoTotal).toBe(
        round2(800 + horaDiurna * 2.0 * 1),
      );
    });
  });

  describe('agregación multi-semana (Sprint 10)', () => {
    it('Sem1 2h extra D + Sem2 3h extra N → totales correctos', () => {
      const horaDiurna = 800 / 30 / 8;
      const result = calcular({
        salarioBase: 800,
        tipoPago: 'mensual',
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-31',
        antiguedad: '1_a_3',
        fechaIngreso: '2025-01-15',
        segmentos: [
          { fecha: '2026-07-01', tipo: 'extra_diurna', horas: 2 },
          { fecha: '2026-07-08', tipo: 'extra_nocturna', horas: 3 },
        ],
      });
      expect(result.bruto.horasExtraDiurna).toBe(
        round2(horaDiurna * 2.0 * 2),
      );
      expect(result.bruto.horasExtraNocturna).toBe(
        round2(horaDiurna * 2.25 * 3),
      );
    });
  });

  describe('sin segmentos de horas', () => {
    it('salario $800 mensual sin extras produce solo salario base', () => {
      const result = calcular({
        salarioBase: 800,
        tipoPago: 'mensual',
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-31',
        antiguedad: '1_a_3',
        fechaIngreso: '2025-01-15',
        segmentos: [],
      });

      expect(result.bruto.horasExtraDiurna).toBe(0);
      expect(result.bruto.horasExtraNocturna).toBe(0);
      expect(result.bruto.diaLibreDiurna).toBe(0);
      expect(result.bruto.diaLibreNocturna).toBe(0);
      expect(result.bruto.asueto).toBe(0);
      expect(result.bruto.brutoTotal).toBe(800);
    });

    it('ISSS = $24 para $800 mensual sin extras', () => {
      const result = calcular({
        salarioBase: 800,
        tipoPago: 'mensual',
        fechaInicio: '2026-07-01',
        fechaFin: '2026-07-31',
        antiguedad: '1_a_3',
        fechaIngreso: '2025-01-15',
        segmentos: [],
      });

      expect(result.descuentos.isss.descuento).toBe(24.0);
      expect(result.descuentos.afp.descuento).toBe(58.0);
      expect(result.descuentos.renta.descuento).toBe(34.47);
    });
  });
});
