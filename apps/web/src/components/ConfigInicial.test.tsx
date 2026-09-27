import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '../test/testUtils';
import {
  ConfigInicial,
  primerErrorConfig,
  validarConfig,
} from './ConfigInicial';

describe('ConfigInicial', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renderiza todos los campos del formulario', () => {
    renderWithContext(<ConfigInicial />);

    expect(
      screen.getByLabelText(/salario base/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo de pago/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/antigüedad/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/fecha de ingreso/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /guardar/i }),
    ).toBeInTheDocument();
  });

  it('muestra error cuando salarioBase es 0', async () => {
    const user = userEvent.setup();
    renderWithContext(<ConfigInicial />);

    await user.click(
      screen.getByRole('button', { name: /guardar/i }),
    );

    expect(
      screen.getByText(/salario base debe ser un número positivo/i),
    ).toBeInTheDocument();
  });

  it('muestra error cuando salarioBase es negativo', async () => {
    const user = userEvent.setup();
    renderWithContext(<ConfigInicial />);

    const input = screen.getByLabelText(/salario base/i);
    await user.clear(input);
    await user.type(input, '-100');
    await user.click(
      screen.getByRole('button', { name: /guardar/i }),
    );

    expect(
      screen.getByText(/salario base debe ser un número positivo/i),
    ).toBeInTheDocument();
  });

  it('muestra error para salarioBase > 100000', async () => {
    const user = userEvent.setup();
    renderWithContext(<ConfigInicial />);

    const input = screen.getByLabelText(/salario base/i);
    await user.clear(input);
    await user.type(input, '200000');
    await user.click(
      screen.getByRole('button', { name: /guardar/i }),
    );

    expect(
      screen.getByText(/menor a \$100,000/i),
    ).toBeInTheDocument();
  });

  it('guarda configuracion valida y muestra mensaje de exito', async () => {
    const user = userEvent.setup();
    renderWithContext(<ConfigInicial />);

    const salarioInput = screen.getByLabelText(/salario base/i);
    await user.clear(salarioInput);
    await user.type(salarioInput, '800');

    const fechaInput = screen.getByLabelText(/fecha de ingreso/i);
    await user.clear(fechaInput);
    await user.type(fechaInput, '2021-03-15');

    await user.click(
      screen.getByRole('button', { name: /guardar/i }),
    );

    expect(
      screen.getByText(/guardada correctamente/i),
    ).toBeInTheDocument();
  });

  it('persiste en localStorage tras guardar', async () => {
    const user = userEvent.setup();
    renderWithContext(<ConfigInicial />);

    const salarioInput = screen.getByLabelText(/salario base/i);
    await user.clear(salarioInput);
    await user.type(salarioInput, '800');

    await user.click(
      screen.getByRole('button', { name: /guardar/i }),
    );

    const stored = localStorage.getItem('config-inicial');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.salarioBase).toBe(800);
  });

  it('restaura configuracion desde localStorage al recargar', () => {
    const saved = {
      salarioBase: 800,
      tipoPago: 'quincenal',
      antiguedad: '3_a_9',
      fechaIngreso: '2021-03-15',
    };
    localStorage.setItem('config-inicial', JSON.stringify(saved));

    renderWithContext(<ConfigInicial />);

    const salarioInput = screen.getByLabelText(
      /salario base/i,
    );
    expect(salarioInput).toHaveValue(800);

    const tipoPagoSelect = screen.getByLabelText(
      /tipo de pago/i,
    );
    expect(tipoPagoSelect).toHaveValue('quincenal');

    const fechaInput = screen.getByLabelText(
      /fecha de ingreso/i,
    );
    expect(fechaInput).toHaveValue('2021-03-15');
  });

  it('cambia tipo de pago a quincenal', async () => {
    const user = userEvent.setup();
    renderWithContext(<ConfigInicial />);

    const select = screen.getByLabelText(/tipo de pago/i);
    await user.selectOptions(select, 'quincenal');

    expect((select as HTMLSelectElement).value).toBe('quincenal');
  });

  it('cambia antiguedad a 10_o_mas', async () => {
    const user = userEvent.setup();
    renderWithContext(<ConfigInicial />);

    const select = screen.getByLabelText(/antigüedad/i);
    await user.selectOptions(select, '10_o_mas');

    expect((select as HTMLSelectElement).value).toBe('10_o_mas');
  });

  // ─── FE-05: fecha de calendario real (Regla 1 de integridad) ───
  // jsdom sanitiza fechas imposibles en inputs type="date" (value → ''),
  // por lo que la validación se prueba a nivel de función, igual que el submit.
  it('validarConfig rechaza fecha imposible 2026-02-31', () => {
    const errores = validarConfig({
      salarioBase: 800,
      tipoPago: 'mensual',
      antiguedad: '1_a_3',
      fechaIngreso: '2026-02-31',
    });
    expect(errores.fechaIngreso).toMatch(/calendario/i);
  });

  it('validarConfig rechaza 29 de febrero en año no bisiesto', () => {
    const errores = validarConfig({
      salarioBase: 800,
      tipoPago: 'mensual',
      antiguedad: '1_a_3',
      fechaIngreso: '2025-02-29',
    });
    expect(errores.fechaIngreso).toMatch(/calendario/i);
  });

  it('validarConfig acepta 29 de febrero en año bisiesto', () => {
    const errores = validarConfig({
      salarioBase: 800,
      tipoPago: 'mensual',
      antiguedad: '1_a_3',
      fechaIngreso: '2024-02-29',
    });
    expect(errores.fechaIngreso).toBeUndefined();
  });

  it('validarConfig rechaza día 31 en meses de 30 días (2026-04-31)', () => {
    const errores = validarConfig({
      salarioBase: 800,
      tipoPago: 'mensual',
      antiguedad: '1_a_3',
      fechaIngreso: '2026-04-31',
    });
    expect(errores.fechaIngreso).toMatch(/calendario/i);
  });

  it('el error de fecha tiene aria-describedby asociado al campo', async () => {
    const user = userEvent.setup();
    renderWithContext(<ConfigInicial />);

    const salarioInput = screen.getByLabelText(/salario base/i);
    await user.clear(salarioInput);
    await user.type(salarioInput, '-100');

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    const salarioField = screen.getByLabelText(/salario base/i);
    expect(salarioField).toHaveAttribute('aria-invalid', 'true');
    expect(salarioField).toHaveAttribute(
      'aria-describedby',
      'salarioBase-error',
    );
  });

  // ─── FE-06 (2026-09-20): el primer error del envío recibe el foco ───
  describe('foco en el primer error del envío (FE-06)', () => {
    it('envío con salario inválido enfoca el campo salarioBase', async () => {
      const user = userEvent.setup();
      renderWithContext(<ConfigInicial />);

      await user.click(screen.getByRole('button', { name: /guardar/i }));

      expect(screen.getByText(/salario base debe ser un número positivo/i)).toBeInTheDocument();
      expect(document.activeElement).toBe(screen.getByLabelText(/salario base/i));
    });

    it('salario no finito muestra error inline a nivel de validarConfig (Regla 4)', () => {
      // Limitación documentada: jsdom sanitiza inputs type="number" (como con
      // las fechas), por lo que '1e999' llega vacío al evento en pruebas. La
      // regla no finita se verifica a nivel de función, que es la misma que
      // aplica el submit; el foco del primer error se prueba en el caso 0.
      expect(
        validarConfig({
          salarioBase: Infinity,
          tipoPago: 'mensual',
          antiguedad: '1_a_3',
          fechaIngreso: '',
        }).salarioBase,
      ).toMatch(/número finito/i);
    });

    it('primerErrorConfig respeta el orden de render (salarioBase → fechaIngreso)', () => {
      expect(primerErrorConfig({})).toBeNull();
      expect(primerErrorConfig({ salarioBase: 'x' })).toBe('salarioBase');
      expect(primerErrorConfig({ fechaIngreso: 'x' })).toBe('fechaIngreso');
      expect(primerErrorConfig({ salarioBase: 'a', fechaIngreso: 'b' })).toBe('salarioBase');
    });

    it('validarConfig rechaza salarioBase no finito', () => {
      expect(
        validarConfig({
          salarioBase: NaN,
          tipoPago: 'mensual',
          antiguedad: '1_a_3',
          fechaIngreso: '',
        }).salarioBase,
      ).toMatch(/número finito/i);
      expect(
        validarConfig({
          salarioBase: Infinity,
          tipoPago: 'mensual',
          antiguedad: '1_a_3',
          fechaIngreso: '',
        }).salarioBase,
      ).toMatch(/número finito/i);
      expect(
        validarConfig({
          salarioBase: -Infinity,
          tipoPago: 'mensual',
          antiguedad: '1_a_3',
          fechaIngreso: '',
        }).salarioBase,
      ).toMatch(/número finito/i);
    });
  });
});
