import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilaDia } from './FilaDia';
import { crearDiaVacio } from './registroTypes';

const diaVacio = crearDiaVacio('2026-07-06');

describe('FilaDia', () => {
  it('muestra el nombre del día y la fecha', () => {
    render(
      <FilaDia
        dia={diaVacio}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('2026-07-06')).toBeInTheDocument();
  });

  it('renderiza campos de jornada, diurna y nocturna', () => {
    render(
      <FilaDia
        dia={diaVacio}
        onChange={() => {}}
      />,
    );

    expect(
      screen.getByLabelText(/Tipo de jornada para Lun/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Horas diurnas para Lun/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Horas nocturnas para Lun/),
    ).toBeInTheDocument();
  });

  it('llama a onChange al modificar horas diurna', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<FilaDia dia={diaVacio} onChange={onChange} />);

    const input = screen.getByLabelText(/Horas diurnas para Lun/);
    await user.clear(input);
    await user.type(input, '8');

    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall).toBeDefined();
    expect(lastCall.horasDiurnas).toBe(8);
  });
});
