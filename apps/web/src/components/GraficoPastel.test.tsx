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

  it('tiene role img para accesibilidad', () => {
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

    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
