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

  it('renderiza campos de jornada base y horas base', () => {
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
      screen.getByLabelText(/Horas base para Lun/),
    ).toBeInTheDocument();
  });

  it('muestra campos de dia libre cuando jornada es descanso', () => {
    const diaDescanso = { ...diaVacio, jornadaBase: 'descanso' as const };

    render(
      <FilaDia
        dia={diaDescanso}
        onChange={() => {}}
      />,
    );

    expect(
      screen.getByLabelText(/Horas día libre diurna para Lun/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Horas día libre nocturna para Lun/),
    ).toBeInTheDocument();
  });

  it('muestra campo de asueto cuando jornada es asueto', () => {
    const diaAsueto = { ...diaVacio, jornadaBase: 'asueto' as const };

    render(
      <FilaDia
        dia={diaAsueto}
        onChange={() => {}}
      />,
    );

    expect(
      screen.getByLabelText(/Horas en asueto para Lun/),
    ).toBeInTheDocument();
  });

  it('llama a onChange al modificar horas base', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<FilaDia dia={diaVacio} onChange={onChange} />);

    const input = screen.getByLabelText(/Horas base para Lun/);
    await user.clear(input);
    await user.type(input, '8');

    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall).toBeDefined();
    expect(lastCall.horasBase).toBe(8);
  });
});
