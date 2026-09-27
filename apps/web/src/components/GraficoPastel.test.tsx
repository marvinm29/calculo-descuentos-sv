import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GraficoPastel } from './GraficoPastel';

describe('GraficoPastel', () => {
  it('renderiza el grafico con datos', () => {
    render(
      <GraficoPastel
        neto={500}
        descuentos={{
          isss: { porcentaje: 3, salarioAsegurable: 600, descuento: 18 },
          afp: { porcentaje: 7.25, salarioCotizable: 600, descuento: 43.5 },
          renta: {
            baseGravable: 538.5,
            tramo: 2,
            porcentajeExceso: 10,
            cuotaFija: 17.67,
            descuento: 37.65,
          },
          totalDescuentos: 99.15,
        }}
      />,
    );

    expect(
      screen.getByText(/Distribuci.*n del Salario Bruto/),
    ).toBeInTheDocument();
  });

  it('expone alternativa textual equivalente y trata el gráfico como decorativo (FE-07)', () => {
    const { container } = render(
      <GraficoPastel
        neto={500}
        descuentos={{
          isss: { porcentaje: 3, salarioAsegurable: 600, descuento: 18 },
          afp: { porcentaje: 7.25, salarioCotizable: 600, descuento: 43.5 },
          renta: {
            baseGravable: 538.5,
            tramo: 2,
            porcentajeExceso: 10,
            cuotaFija: 17.67,
            descuento: 37.65,
          },
          totalDescuentos: 99.15,
        }}
      />,
    );

    // La tabla resume los mismos importes que el gráfico (representación accesible).
    const tabla = screen.getByRole('table', {
      name: /distribución del salario bruto por concepto/i,
    });
    expect(tabla).toBeInTheDocument();
    expect(screen.getAllByText('$500.00').length).toBeGreaterThan(0);
    expect(screen.getByText('$18.00')).toBeInTheDocument();
    expect(screen.getByText('$43.50')).toBeInTheDocument();
    expect(screen.getByText('$37.65')).toBeInTheDocument();
    // El gráfico es decorativo: sin `role="img"` sin nombre (evita axe svg-img-alt).
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(
      screen.queryByRole('img', { name: /gráfico de distribución/i }),
    ).not.toBeInTheDocument();
  });

  it('no usa blur/backdrop-filter en el tooltip (FE-07)', () => {
    // La técnica prohibida se verifica en el código fuente vía rg (gate).
    // Aquí se comprueba que el componente no renderiza estilos con blur.
    const { container } = render(
      <GraficoPastel
        neto={500}
        descuentos={{
          isss: { porcentaje: 3, salarioAsegurable: 600, descuento: 18 },
          afp: { porcentaje: 7.25, salarioCotizable: 600, descuento: 43.5 },
          renta: {
            baseGravable: 538.5,
            tramo: 2,
            porcentajeExceso: 10,
            cuotaFija: 17.67,
            descuento: 37.65,
          },
          totalDescuentos: 99.15,
        }}
      />,
    );
    expect(container.innerHTML).not.toContain('backdrop');
    expect(container.innerHTML).not.toContain('blur');
  });
});
