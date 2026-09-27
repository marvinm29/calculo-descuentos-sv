import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IncentivosForm, validarIncentivo } from './IncentivosForm';
import { LIMITES_CONTRATO } from '@calc/shared';
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

  // ─── FE-04: límite 50 y validación inline del concepto ───
  it('deshabilita Agregar al alcanzar 50 incentivos y muestra el límite', () => {
    const llenos: Incentivo[] = Array.from({ length: LIMITES_CONTRATO.MAX_INCENTIVOS }, (_, i) => ({
      id: `inc${i}`,
      concepto: `Bono ${i}`,
      monto: 10,
      aplicaDescuentos: true,
    }));
    render(<IncentivosForm incentivos={llenos} onChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Agregar' })).toBeDisabled();
    expect(screen.getByText(/Máximo 50 incentivos/)).toBeInTheDocument();
  });

  it('marca error inline con monto > 0 y concepto en blanco', () => {
    const incentivos: Incentivo[] = [
      { id: 'inc-x', concepto: '', monto: 50, aplicaDescuentos: true },
    ];
    render(<IncentivosForm incentivos={incentivos} onChange={() => {}} />);

    expect(screen.getByRole('alert')).toHaveTextContent(/concepto/i);
    const concepto = screen.getByLabelText('Concepto');
    expect(concepto).toHaveAttribute('aria-invalid', 'true');
    expect(concepto).toHaveAttribute(
      'aria-describedby',
      'incentivo-error-inc-x',
    );
  });

  it('el error inline también considera concepto con solo espacios', () => {
    const incentivos: Incentivo[] = [
      { id: 'inc-x', concepto: '   ', monto: 50, aplicaDescuentos: true },
    ];
    render(<IncentivosForm incentivos={incentivos} onChange={() => {}} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('no marca error en estados intermedios de llenado (concepto sin monto)', () => {
    const incentivos: Incentivo[] = [
      { id: 'inc-x', concepto: 'Bono', monto: 0, aplicaDescuentos: true },
    ];
    render(<IncentivosForm incentivos={incentivos} onChange={() => {}} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('validarIncentivo rechaza whitespace y acepta fila vacía o completa', () => {
    expect(validarIncentivo({ id: '1', concepto: '  ', monto: 5, aplicaDescuentos: true })).not.toBeNull();
    expect(validarIncentivo({ id: '1', concepto: '', monto: 0, aplicaDescuentos: true })).toBeNull();
    expect(validarIncentivo({ id: '1', concepto: 'Bono', monto: 5, aplicaDescuentos: true })).toBeNull();
  });

  // ─── Regla 4 en cliente: NaN, ±Infinity, negativos, fuera de rango ───
  describe('validarIncentivo numérica (Regla 4 en cliente, 2026-09-20)', () => {
    it('rechaza NaN en el monto', () => {
      expect(
        validarIncentivo({ id: '1', concepto: 'Bono', monto: NaN, aplicaDescuentos: true }),
      ).toMatch(/número finito/i);
    });

    it('rechaza Infinity y -Infinity', () => {
      expect(
        validarIncentivo({ id: '1', concepto: 'Bono', monto: Infinity, aplicaDescuentos: true }),
      ).toMatch(/número finito/i);
      expect(
        validarIncentivo({ id: '1', concepto: 'Bono', monto: -Infinity, aplicaDescuentos: true }),
      ).toMatch(/número finito/i);
    });

    it('rechaza montos negativos', () => {
      expect(
        validarIncentivo({ id: '1', concepto: 'Bono', monto: -5, aplicaDescuentos: true }),
      ).toMatch(/negativo/i);
    });

    it('rechaza concepto fuera de rango (> 100 caracteres)', () => {
      expect(
        validarIncentivo({
          id: '1',
          concepto: 'x'.repeat(LIMITES_CONTRATO.MAX_CONCEPTO + 1),
          monto: 5,
          aplicaDescuentos: true,
        }),
      ).toMatch(/exceder 100 caracteres/i);
    });

    it('muestra el error de monto no finito junto al campo con asociación', () => {
      const incentivos: Incentivo[] = [
        { id: 'inc-y', concepto: 'Bono', monto: Infinity, aplicaDescuentos: true },
      ];
      render(<IncentivosForm incentivos={incentivos} onChange={() => {}} />);

      expect(screen.getByRole('alert')).toHaveTextContent(/número finito/i);
      const monto = screen.getByLabelText('Monto (USD)');
      expect(monto).toHaveAttribute('aria-invalid', 'true');
      expect(monto).toHaveAttribute('aria-describedby', 'incentivo-error-inc-y');
    });

    it('el monto negativo escrito en el input muestra error inline', () => {
      // Harness controlado: el onChange actualiza el estado real del componente
      // (con un mock el prop no cambia y el error no aparecería).
      function Contenedor() {
        const [filas, setFilas] = useState<Incentivo[]>([
          { id: 'inc-n', concepto: 'Bono', monto: 0, aplicaDescuentos: true },
        ]);
        return <IncentivosForm incentivos={filas} onChange={setFilas} />;
      }
      render(<Contenedor />);

      const monto = screen.getByLabelText('Monto (USD)');
      fireEvent.change(monto, { target: { value: '-25' } });

      expect(screen.getByRole('alert')).toHaveTextContent(/negativo/i);
      expect(monto).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
