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

  it('botón Agregar bloque funciona', async () => {
    const user = userEvent.setup();
    renderWithContext(<RegistroSemanal />);

    const btn = screen.getByText('+ Agregar bloque');
    await user.click(btn);

    expect(
      screen.getByDisplayValue('08:00'),
    ).toBeInTheDocument();
  });

  it('persiste datos en localStorage al agregar bloque', async () => {
    const user = userEvent.setup();
    renderWithContext(<RegistroSemanal />);

    await user.click(screen.getByText('+ Agregar bloque'));

    await waitFor(() => {
      const stored = localStorage.getItem('registro-semanal');
      expect(stored).not.toBeNull();
      expect(stored).toContain('"bloques"');
    });
  });
});
