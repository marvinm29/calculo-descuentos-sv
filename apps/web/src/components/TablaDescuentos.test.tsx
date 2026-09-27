import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { DescuentosResponse } from '@calc/shared';
import { TablaDescuentos } from './TablaDescuentos';

// Fixture del contrato ($800 mensual): ver specs/api-contract.md y el test
// "Renta: $800 mensual produce $34.47" en @calc/shared.
const descuentos800: DescuentosResponse = {
  isss: { porcentaje: 3, salarioAsegurable: 800, descuento: 24 },
  afp: { porcentaje: 7.25, salarioCotizable: 800, descuento: 58 },
  renta: {
    baseGravable: 718,
    tramo: 2,
    porcentajeExceso: 10,
    cuotaFija: 17.67,
    descuento: 34.47,
  },
  totalDescuentos: 116.47,
};

describe('TablaDescuentos', () => {
  it('lista ISSS, AFP y renta con su base y descuento', () => {
    render(<TablaDescuentos descuentos={descuentos800} />);
    expect(screen.getByText(/ISSS \(3% sobre \$800\.00\)/)).toBeInTheDocument();
    expect(screen.getByText(/AFP \(7\.25% sobre \$800\.00\)/)).toBeInTheDocument();
    expect(screen.getByText(/tramo 2, cuota fija \$17\.67 \+ 10%/)).toBeInTheDocument();
    expect(screen.getByText('-$24.00')).toBeInTheDocument();
    expect(screen.getByText('-$58.00')).toBeInTheDocument();
    expect(screen.getByText('-$34.47')).toBeInTheDocument();
  });

  it('el total de descuentos es la suma de los tres', () => {
    render(<TablaDescuentos descuentos={descuentos800} />);
    expect(screen.getByText('Total descuentos')).toBeInTheDocument();
    expect(screen.getByText('-$116.47')).toBeInTheDocument();
  });

  it('la cuota fija nunca aparece como base del exceso (regresión de copy)', () => {
    render(<TablaDescuentos descuentos={descuentos800} />);
    // "sobre exceso de $17.67" confundía la cuota fija con la base del exceso
    expect(screen.queryByText(/sobre exceso de \$17\.67/)).not.toBeInTheDocument();
  });
});
