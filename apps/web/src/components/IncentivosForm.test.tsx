import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('actualiza el concepto al escribir', () => {
    const onChange = vi.fn();
    const incentivos: Incentivo[] = [
      { id: '1', concepto: 'Bono', monto: 100, aplicaDescuentos: true },
    ];
    render(<IncentivosForm incentivos={incentivos} onChange={onChange} />);

    fireEvent.change(screen.getByDisplayValue('Bono'), {
      target: { value: 'Comisión ventas' },
    });
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ concepto: 'Comisión ventas' }),
    ]);
  });

  it('actualiza el monto (vacío → 0)', () => {
    const onChange = vi.fn();
    const incentivos: Incentivo[] = [
      { id: '1', concepto: 'Bono', monto: 100, aplicaDescuentos: true },
    ];
    render(<IncentivosForm incentivos={incentivos} onChange={onChange} />);

    fireEvent.change(screen.getByDisplayValue('100'), {
      target: { value: '' },
    });
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ monto: 0 }),
    ]);
  });

  it('alterna aplicaDescuentos al hacer clic en el checkbox', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const incentivos: Incentivo[] = [
      { id: '1', concepto: 'Bono', monto: 100, aplicaDescuentos: true },
    ];
    render(<IncentivosForm incentivos={incentivos} onChange={onChange} />);

    await user.click(screen.getByLabelText('Aplica descuentos de ley'));
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ aplicaDescuentos: false }),
    ]);
  });
});
