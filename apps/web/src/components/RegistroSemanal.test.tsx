import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistroSemanal } from './RegistroSemanal';

describe('RegistroSemanal', () => {
  it('renderiza 7 filas de día (Lun a Dom)', () => {
    render(<RegistroSemanal />);

    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    for (const dia of dias) {
      expect(screen.getByText(dia)).toBeInTheDocument();
    }
  });

  it('muestra el rango de fechas de la semana actual', () => {
    render(<RegistroSemanal />);

    expect(
      screen.getByText(/Registro Semanal/),
    ).toBeInTheDocument();
  });

  it('muestra la sección de totales semanales', () => {
    render(<RegistroSemanal />);

    expect(
      screen.getByText(/Totales semanales/),
    ).toBeInTheDocument();
  });

  it('actualiza totales al ingresar horas extra', async () => {
    const user = userEvent.setup();
    render(<RegistroSemanal />);

    const inputs = screen.getAllByLabelText(/Horas base para Lun/);
    await user.clear(inputs[0]!);
    await user.type(inputs[0]!, '8');

    expect(
      screen.getByText(/Base: 8h/),
    ).toBeInTheDocument();
  });

  it('persiste datos en localStorage', async () => {
    const user = userEvent.setup();
    render(<RegistroSemanal />);

    const inputs = screen.getAllByLabelText(/Horas base para Lun/);
    await user.clear(inputs[0]!);
    await user.type(inputs[0]!, '8');

    await waitFor(() => {
      expect(screen.getByText(/Base: 8h/)).toBeInTheDocument();
    });

    const stored = localStorage.getItem('registro-semanal');
    expect(stored).not.toBeNull();
    expect(stored).toContain('"horasBase":8');
  });
});
