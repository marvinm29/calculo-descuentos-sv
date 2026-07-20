import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '../test/testUtils';
import { ConfigInicial } from './ConfigInicial';

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
});
