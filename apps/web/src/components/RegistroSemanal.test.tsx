import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '../test/testUtils';
import { RegistroSemanal } from './RegistroSemanal';

describe('RegistroSemanal', () => {
  it('renderiza el título y el date picker', () => {
    renderWithContext(<RegistroSemanal />);

    expect(
      screen.getByText('Registro de Horas'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Seleccionar fecha'),
    ).toBeInTheDocument();
  });

  it('renderiza la fila de entrada para el día seleccionado', () => {
    renderWithContext(<RegistroSemanal />);

    expect(
      screen.getByText('Jornada base'),
    ).toBeInTheDocument();
  });

  it('muestra el resumen semanal visual con navegación', () => {
    renderWithContext(<RegistroSemanal />);

    expect(
      screen.getByText(/Esta semana|Semana/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Semana anterior'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('Semana siguiente'),
    ).toBeInTheDocument();
  });

  it('actualiza datos al ingresar horas', async () => {
    const user = userEvent.setup();
    renderWithContext(<RegistroSemanal />);

    const inputs = screen.getAllByLabelText(/Horas base para/);
    await user.clear(inputs[0]!);
    await user.type(inputs[0]!, '8');

    expect(
      screen.getByText(/Total/),
    ).toBeInTheDocument();
  });

  it('persiste datos en localStorage', async () => {
    const user = userEvent.setup();
    renderWithContext(<RegistroSemanal />);

    const inputs = screen.getAllByLabelText(/Horas base para/);
    await user.clear(inputs[0]!);
    await user.type(inputs[0]!, '8');

    await waitFor(() => {
      const stored = localStorage.getItem('registro-semanal');
      expect(stored).not.toBeNull();
      expect(stored).toContain('"horasBase":8');
    });
  });
});
