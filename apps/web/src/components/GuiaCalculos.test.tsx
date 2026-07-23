import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GuiaCalculos } from './GuiaCalculos';

describe('GuiaCalculos', () => {
  it('renderiza titulo y secciones principales', () => {
    render(<GuiaCalculos />);
    expect(screen.getByText('Guía de Cálculos')).toBeInTheDocument();
    expect(screen.getByText('Salario por Hora')).toBeInTheDocument();
    expect(screen.getByText('ISSS (Seguro Social)')).toBeInTheDocument();
    expect(screen.getByText('AFP (Fondo de Pensiones)')).toBeInTheDocument();
    expect(screen.getByText('Renta (ISR)')).toBeInTheDocument();
  });

  it('incluye seccion de recargo nocturnidad', () => {
    render(<GuiaCalculos />);
    expect(
      screen.getByText(/Recargo de Nocturnidad/),
    ).toBeInTheDocument();
  });

  it('incluye seccion de incentivos', () => {
    render(<GuiaCalculos />);
    expect(
      screen.getByText(/Los bonos y comisiones habituales forman parte del salario/),
    ).toBeInTheDocument();
  });

  it('muestra el diagrama de flujo', () => {
    render(<GuiaCalculos />);
    expect(screen.getByText('Salario Base')).toBeInTheDocument();
    expect(screen.getByText('Salario Bruto')).toBeInTheDocument();
  });
});
