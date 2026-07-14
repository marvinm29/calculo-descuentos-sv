import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TablaTasas } from './TablaTasas';

describe('TablaTasas', () => {
  it('muestra el encabezado y la fecha de actualizacion', () => {
    render(<TablaTasas />);
    expect(
      screen.getByText(/Tasas de Referencia/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Julio 2026/),
    ).toBeInTheDocument();
  });

  it('incluye enlaces a fuentes oficiales .gob.sv', () => {
    render(<TablaTasas />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    expect(links.some((l) => l.getAttribute('href')?.includes('.gob.sv'))).toBe(
      true,
    );
  });

  it('muestra ISSS, AFP, Renta y Aguinaldo', () => {
    render(<TablaTasas />);
    expect(screen.getByText(/ISSS \(Trabajador\)/)).toBeInTheDocument();
    expect(screen.getByText(/AFP \(Trabajador\)/)).toBeInTheDocument();
    expect(screen.getByText('Renta — Tramo I')).toBeInTheDocument();
    expect(screen.getByText(/Aguinaldo 1–3/)).toBeInTheDocument();
    expect(screen.getByText(/Vacaciones \(bono\)/)).toBeInTheDocument();
    expect(screen.getByText('Quincena 25')).toBeInTheDocument();
  });
});
