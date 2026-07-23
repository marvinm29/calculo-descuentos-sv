import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SemanaExtrasCard } from './SemanaExtrasCard';
import type { SemanaRegistro } from '@calc/shared';

const emptySemana: SemanaRegistro = {
  horasBaseNocturnas: 0,
  extraDiurna: 0,
  extraNocturna: 0,
  diaLibreDiurna: 0,
  diaLibreNocturna: 0,
  asueto: 0,
};

describe('SemanaExtrasCard', () => {
  it('renderiza titulo con numero de semana', () => {
    render(
      <SemanaExtrasCard
        index={0}
        value={emptySemana}
        onChange={() => {}}
        canRemove={false}
      />,
    );
    expect(screen.getByText('Semana 1')).toBeInTheDocument();
  });

  it('muestra boton eliminar si canRemove es true', () => {
    render(
      <SemanaExtrasCard
        index={0}
        value={emptySemana}
        onChange={() => {}}
        onRemove={() => {}}
        canRemove={true}
      />,
    );
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('llama onChange al cambiar un input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SemanaExtrasCard
        index={0}
        value={emptySemana}
        onChange={onChange}
        canRemove={false}
      />,
    );

    const inputs = screen.getAllByRole('spinbutton');
    await user.type(inputs[0]!, '5');

    expect(onChange).toHaveBeenCalled();
  });
});
