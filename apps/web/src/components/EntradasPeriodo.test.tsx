import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntradasPeriodo } from './EntradasPeriodo';
import type { EntradaPeriodo } from '@calc/shared';

const entry: EntradaPeriodo = {
  id: 'ent-1',
  fecha: '2026-07-01',
  tipo: 'extra',
  horasDiurnas: 2,
  horasNocturnas: 1,
};

describe('EntradasPeriodo', () => {
  it('muestra mensaje vacio cuando no hay entradas', () => {
    render(<EntradasPeriodo entradas={[]} onChange={() => {}} />);
    expect(
      screen.getByText('No hay entradas registradas. Agregá una para empezar.'),
    ).toBeInTheDocument();
  });

  it('agrega una entrada al hacer clic en Agregar entrada', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EntradasPeriodo entradas={[]} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Agregar entrada' }));
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        tipo: 'extra',
        horasDiurnas: 0,
        horasNocturnas: 0,
      }),
    ]);
  });

  it('renderiza entradas existentes', () => {
    render(<EntradasPeriodo entradas={[entry]} onChange={() => {}} />);
    expect(screen.getByDisplayValue('2026-07-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
  });

  it('actualiza fecha al cambiar el date input', () => {
    const onChange = vi.fn();
    render(<EntradasPeriodo entradas={[entry]} onChange={onChange} />);

    fireEvent.change(screen.getByDisplayValue('2026-07-01'), {
      target: { value: '2026-07-15' },
    });

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ fecha: '2026-07-15' }),
    ]);
  });

  it('actualiza horas diurnas al cambiar el input', () => {
    const onChange = vi.fn();
    render(<EntradasPeriodo entradas={[entry]} onChange={onChange} />);

    fireEvent.change(screen.getByDisplayValue('2'), {
      target: { value: '5' },
    });

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ horasDiurnas: 5 }),
    ]);
  });

  it('actualiza horas nocturnas al cambiar el input', () => {
    const onChange = vi.fn();
    render(<EntradasPeriodo entradas={[entry]} onChange={onChange} />);

    fireEvent.change(screen.getByDisplayValue('1'), {
      target: { value: '3' },
    });

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ horasNocturnas: 3 }),
    ]);
  });

  it('cambia tipo al seleccionar otra opcion', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EntradasPeriodo entradas={[entry]} onChange={onChange} />);

    await user.selectOptions(screen.getByRole('combobox'), 'asueto');

    const lastCall = onChange.mock.calls.at(-1)?.[0] as EntradaPeriodo[];
    expect(lastCall[0]?.tipo).toBe('asueto');
  });

  it('elimina una entrada al hacer clic en Eliminar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EntradasPeriodo entradas={[entry]} onChange={onChange} />);

    await user.click(screen.getAllByText('Eliminar')[0]!);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('muestra factor del tipo de la ultima entrada', () => {
    const lastEntry: EntradaPeriodo = {
      id: 'ent-2',
      fecha: '2026-07-02',
      tipo: 'asueto',
      horasDiurnas: 8,
      horasNocturnas: 0,
    };
    render(<EntradasPeriodo entradas={[entry, lastEntry]} onChange={() => {}} />);
    expect(screen.getByText(/Factor: 2\.00x/)).toBeInTheDocument();
  });
});
