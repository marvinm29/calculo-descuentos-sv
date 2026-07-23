import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IncentivosForm } from './IncentivosForm';
import type { Incentivo } from '@calc/shared';

describe('IncentivosForm', () => {
  it('muestra mensaje vacio cuando no hay incentivos', () => {
    render(<IncentivosForm incentivos={[]} onChange={() => {}} />);
    expect(
      screen.getByText('No hay incentivos registrados.'),
    ).toBeInTheDocument();
  });

  it('agrega un incentivo al hacer clic en Agregar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<IncentivosForm incentivos={[]} onChange={onChange} />);

    await user.click(screen.getByText('Agregar'));
    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          concepto: '',
          monto: 0,
          aplicaDescuentos: true,
        }),
      ]),
    );
  });

  it('renderiza incentivos existentes', () => {
    const incentivos: Incentivo[] = [
      { id: '1', concepto: 'Bono', monto: 100, aplicaDescuentos: true },
    ];
    render(<IncentivosForm incentivos={incentivos} onChange={() => {}} />);
    expect(screen.getByDisplayValue('Bono')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  it('elimina un incentivo', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const incentivos: Incentivo[] = [
      { id: '1', concepto: 'Bono', monto: 100, aplicaDescuentos: true },
    ];
    render(<IncentivosForm incentivos={incentivos} onChange={onChange} />);

    await user.click(screen.getAllByText('Eliminar')[0]!);
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
