import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JornadaSelector } from './JornadaSelector';
import type { JornadaConfig } from '@calc/shared';

const defaultConfig: JornadaConfig = {
  tipo: 'tiempo_completo',
  horasSemanales: 44,
  modalidad: 'diurna',
};

describe('JornadaSelector', () => {
  it('renderiza con valores por defecto', () => {
    render(<JornadaSelector value={defaultConfig} onChange={() => {}} />);
    expect(screen.getByText('Jornada Laboral')).toBeInTheDocument();
    expect(screen.getByText('Diurna')).toBeInTheDocument();
    expect(screen.getByText('Nocturna')).toBeInTheDocument();
  });

  it('llama onChange al cambiar a personalizado', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<JornadaSelector value={defaultConfig} onChange={onChange} />);

    await user.selectOptions(
      screen.getByRole('combobox'),
      'personalizado',
    );

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'personalizado', horasSemanales: 44 }),
    );
  });

  it('llama onChange al cambiar modalidad a nocturna', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<JornadaSelector value={defaultConfig} onChange={onChange} />);

    await user.click(screen.getByLabelText('Nocturna'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ modalidad: 'nocturna' }),
    );
  });

  it('muestra advertencia de exceso en personalizado nocturno', () => {
    const config: JornadaConfig = {
      tipo: 'personalizado',
      horasSemanales: 50,
      modalidad: 'nocturna',
    };
    render(<JornadaSelector value={config} onChange={() => {}} />);
    expect(
      screen.getByText(/El exceso sobre 39h se pagará como hora extra/),
    ).toBeInTheDocument();
  });
});
