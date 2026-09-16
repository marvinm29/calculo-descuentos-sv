import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Prestaciones } from './Prestaciones';
import type { PrestacionesResponse } from '@calc/shared';

const completas: PrestacionesResponse = {
  aguinaldo: { dias: 19, monto: 506.67, proporcional: false },
  vacaciones: { porcentaje: 30, monto: 240 },
  quincena25: { porcentaje: 50, monto: 400 },
};

describe('Prestaciones', () => {
  it('no renderiza nada cuando todas las prestaciones son null', () => {
    const { container } = render(
      <Prestaciones
        prestaciones={{ aguinaldo: null, vacaciones: null, quincena25: null }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza aguinaldo, vacaciones y quincena25 cuando existen', () => {
    render(<Prestaciones prestaciones={completas} />);
    expect(screen.getByText(/Aguinaldo \(19 días\)/)).toBeInTheDocument();
    expect(screen.getByText('$506.67')).toBeInTheDocument();
    expect(screen.getByText(/Vacaciones \(30% de 15/)).toBeInTheDocument();
    expect(screen.getByText('$240.00')).toBeInTheDocument();
    expect(screen.getByText(/Quincena 25 \(50% del/)).toBeInTheDocument();
    expect(screen.getByText('$400.00')).toBeInTheDocument();
  });

  it('marca aguinaldo proporcional cuando corresponde', () => {
    render(
      <Prestaciones
        prestaciones={{
          aguinaldo: { dias: 15, monto: 100, proporcional: true },
          vacaciones: null,
          quincena25: null,
        }}
      />,
    );
    expect(screen.getByText(/proporcional/)).toBeInTheDocument();
    expect(screen.getByText(/Informativas/)).toBeInTheDocument();
  });
});
