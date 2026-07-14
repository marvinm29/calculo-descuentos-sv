import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultadoNeto } from './ResultadoNeto';
import type { CalculoState } from '@calc/shared';

const idleState: CalculoState = { status: 'idle' };
const loadingState: CalculoState = { status: 'loading' };
const errorState: CalculoState = {
  status: 'error',
  error: 'Error de prueba',
};

const successState: CalculoState = {
  status: 'success',
  data: {
    bruto: {
      salarioBase: 800,
      horasExtraDiurna: 13.33,
      horasExtraNocturna: 0,
      diaLibreDiurna: 0,
      diaLibreNocturna: 0,
      asueto: 0,
      brutoTotal: 813.33,
    },
    descuentos: {
      isss: { porcentaje: 3, salarioAsegurable: 813.33, descuento: 24.4 },
      afp: { porcentaje: 7.25, salarioCotizable: 813.33, descuento: 58.97 },
      renta: {
        baseGravable: 729.96,
        tramo: 2,
        porcentajeExceso: 10,
        cuotaFija: 17.67,
        descuento: 56.8,
      },
      totalDescuentos: 140.17,
    },
    prestaciones: {
      aguinaldo: { dias: 15, monto: 400, proporcional: false },
      vacaciones: { porcentaje: 30, monto: 120 },
      quincena25: { porcentaje: 50, monto: 400 },
    },
    neto: { salarioLiquido: 673.16 },
  },
};

describe('ResultadoNeto', () => {
  it('muestra estado idle', () => {
    render(<ResultadoNeto state={idleState} />);
    expect(
      screen.getByText(/configur.* tu salario/i),
    ).toBeInTheDocument();
  });

  it('muestra estado loading', () => {
    render(<ResultadoNeto state={loadingState} />);
    expect(screen.getByText(/Calculando/)).toBeInTheDocument();
  });

  it('muestra estado error', () => {
    render(<ResultadoNeto state={errorState} />);
    expect(screen.getByText('Error de prueba')).toBeInTheDocument();
  });

  it('muestra calculo completo en estado success', () => {
    render(<ResultadoNeto state={successState} />);

    expect(screen.getByText(/Salario Bruto/)).toBeInTheDocument();
    expect(screen.getByText(/Descuentos de Ley/)).toBeInTheDocument();
    expect(screen.getByText(/Prestaciones/)).toBeInTheDocument();
    expect(screen.getByText(/Salario Neto/)).toBeInTheDocument();
    expect(screen.getByText(/\$673\.16/)).toBeInTheDocument();
  });

  it('muestra ISSS, AFP y Renta', () => {
    render(<ResultadoNeto state={successState} />);
    expect(screen.getByText(/ISSS/)).toBeInTheDocument();
    expect(screen.getByText(/AFP/)).toBeInTheDocument();
    expect(screen.getByText(/Renta/)).toBeInTheDocument();
    expect(screen.getByText(/Aguinaldo/)).toBeInTheDocument();
  });
});
