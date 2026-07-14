import { describe, it, expect } from 'vitest';
import {
  calcularAguinaldo,
  calcularVacaciones,
  calcularQuincena25,
  calcularPrestaciones,
} from '../prestaciones';
import { AGUINALDO_DIAS, VACACIONES } from '../../tasas';
import { calcularSalarioHora, round2 } from '../horasExtra';

describe('calcularAguinaldo', () => {
  const { salarioDiario } = calcularSalarioHora(800);

  it('antiguedad 3_a_9 → 19 días para salario $800', () => {
    const result = calcularAguinaldo(
      800,
      '3_a_9',
      '2021-03-15',
      '2026-07-15',
    );
    expect(result.dias).toBe(19);
    expect(result.monto).toBe(round2(19 * salarioDiario));
    expect(result.proporcional).toBe(false);
  });

  it('antiguedad 1_a_3 → 15 días', () => {
    const result = calcularAguinaldo(
      800,
      '1_a_3',
      '2025-01-01',
      '2026-07-15',
    );
    expect(result.dias).toBe(AGUINALDO_DIAS.DE_1_A_3);
    expect(result.monto).toBe(round2(15 * salarioDiario));
    expect(result.proporcional).toBe(false);
  });

  it('antiguedad 10_o_mas → 21 días', () => {
    const result = calcularAguinaldo(
      800,
      '10_o_mas',
      '2010-01-01',
      '2026-07-15',
    );
    expect(result.dias).toBe(AGUINALDO_DIAS.DE_10_O_MAS);
    expect(result.monto).toBe(round2(21 * salarioDiario));
  });

  it('antiguedad menos_1 → proporcional con dias exactos', () => {
    // Empleado ingresó hace 180 días en un año de 365
    const result = calcularAguinaldo(
      800,
      'menos_1',
      '2026-01-15',
      '2026-07-14',
    );
    expect(result.proporcional).toBe(true);
    // 180 días / 365 * 15 = 7.3972... días
    // Monto = 7.3972 * 26.6667 = 197.26...
    expect(result.dias).toBeGreaterThan(7);
    expect(result.dias).toBeLessThan(8);
    expect(result.monto).toBeGreaterThan(0);
  });

  it('menos_1 con pocos dias da resultado > 0', () => {
    const result = calcularAguinaldo(
      1000,
      'menos_1',
      '2026-07-10',
      '2026-07-15',
    );
    expect(result.monto).toBeGreaterThan(0);
    expect(result.proporcional).toBe(true);
  });
});

describe('calcularVacaciones', () => {
  it('calcula 30% de 15 dias de salario', () => {
    const { salarioDiario } = calcularSalarioHora(800);
    const result = calcularVacaciones(800);
    const expected =
      salarioDiario * VACACIONES.DIAS_POR_ANO * VACACIONES.BONO_PORCENTAJE;
    expect(result.porcentaje).toBe(30.0);
    expect(result.monto).toBe(round2(expected));
    expect(result.monto).toBe(120.0);
  });

  it('salario $1000 → vacaciones = $150', () => {
    const result = calcularVacaciones(1000);
    // 1000/30*15*0.30 = 500*0.30 = 150
    expect(result.monto).toBe(150.0);
  });

  it('salario 0 produce monto 0', () => {
    const result = calcularVacaciones(0);
    expect(result.monto).toBe(0);
  });
});

describe('calcularQuincena25', () => {
  it('aplica a salario <= $1500', () => {
    const result = calcularQuincena25(800);
    expect(result).not.toBeNull();
    expect(result!.porcentaje).toBe(50.0);
    expect(result!.monto).toBe(400.0);
  });

  it('aplica a salario exacto $1500', () => {
    const result = calcularQuincena25(1500);
    expect(result).not.toBeNull();
    expect(result!.monto).toBe(750.0);
  });

  it('null para salario > $1500', () => {
    const result = calcularQuincena25(1500.01);
    expect(result).toBeNull();
  });

  it('null para salario alto', () => {
    const result = calcularQuincena25(5000);
    expect(result).toBeNull();
  });
});

describe('calcularPrestaciones', () => {
  it('retorna todas las prestaciones para salario $800, 3_a_9', () => {
    const result = calcularPrestaciones(
      800,
      '3_a_9',
      '2021-03-15',
      '2026-07-15',
    );

    expect(result.aguinaldo).not.toBeNull();
    expect(result.aguinaldo!.dias).toBe(19);

    expect(result.vacaciones).not.toBeNull();
    expect(result.vacaciones!.monto).toBe(120.0);

    expect(result.quincena25).not.toBeNull();
    expect(result.quincena25!.monto).toBe(400.0);
  });

  it('quincena25 es null para salario > $1500', () => {
    const result = calcularPrestaciones(
      2000,
      '10_o_mas',
      '2010-01-01',
      '2026-07-15',
    );
    expect(result.quincena25).toBeNull();
    expect(result.aguinaldo).not.toBeNull();
    expect(result.vacaciones).not.toBeNull();
  });
});
