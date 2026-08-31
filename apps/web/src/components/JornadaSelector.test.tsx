import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JornadaSelector } from './JornadaSelector';
import type { JornadaConfig } from '@calc/shared';

const diurna: JornadaConfig = { modalidad: 'diurna' };

describe('JornadaSelector', () => {
  it('renderiza con valores por defecto', () => {
    render(<JornadaSelector value={diurna} onChange={() => {}} />);
    expect(screen.getByText('Jornada Laboral')).toBeInTheDocument();
    expect(screen.getByLabelText('Diurna')).toBeInTheDocument();
    expect(screen.getByLabelText('Nocturna')).toBeInTheDocument();
  });

  it('marca la modalidad activa como seleccionada', () => {
    render(<JornadaSelector value={{ modalidad: 'nocturna' }} onChange={() => {}} />);
    expect(screen.getByLabelText('Nocturna')).toBeChecked();
    expect(screen.getByLabelText('Diurna')).not.toBeChecked();
  });

  it('llama onChange al cambiar modalidad a nocturna', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<JornadaSelector value={diurna} onChange={onChange} />);

    await user.click(screen.getByLabelText('Nocturna'));
    expect(onChange).toHaveBeenCalledWith({ modalidad: 'nocturna' });
  });

  it('llama onChange al volver a diurna', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<JornadaSelector value={{ modalidad: 'nocturna' }} onChange={onChange} />);

    await user.click(screen.getByLabelText('Diurna'));
    expect(onChange).toHaveBeenCalledWith({ modalidad: 'diurna' });
  });

  it('no promete pago automatico de exceso de jornada', () => {
    render(<JornadaSelector value={diurna} onChange={() => {}} />);
    expect(
      screen.queryByText(/exceso sobre 44h|se pagará como hora extra/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/tiempo completo|personalizado|horas semanales/i),
    ).not.toBeInTheDocument();
  });
});