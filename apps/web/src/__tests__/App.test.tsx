import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App';

describe('App', () => {
  it('renderiza titulo principal', () => {
    render(<App />);
    expect(
      screen.getByText('Descuentos de Ley SV'),
    ).toBeInTheDocument();
  });

  it('renderiza configuracion inicial', () => {
    render(<App />);
    expect(
      screen.getByText('Configuración Inicial'),
    ).toBeInTheDocument();
  });

  it('renderiza selector de jornada', () => {
    render(<App />);
    expect(screen.getByText('Jornada Laboral')).toBeInTheDocument();
  });

  it('renderiza entradas del periodo', () => {
    render(<App />);
    expect(screen.getByText('Horas del Periodo')).toBeInTheDocument();
  });

  it('renderiza seccion de incentivos', () => {
    render(<App />);
    expect(
      screen.getByText('Incentivos (bonos, comisiones, etc.)'),
    ).toBeInTheDocument();
  });

  describe('cálculo a la carta (sin declarar jornada semanal)', () => {
    it('calcula el resultado con solo salario base y cero entradas', () => {
      localStorage.setItem(
        'config-inicial',
        JSON.stringify({
          salarioBase: 800,
          tipoPago: 'mensual',
          antiguedad: '1_a_3',
          fechaIngreso: '2020-01-01',
        }),
      );

      render(<App />);

      expect(screen.getByText('Resultado del Periodo')).toBeInTheDocument();
    });

    it('se mantiene sin resultado cuando el salario base es 0', () => {
      localStorage.setItem(
        'config-inicial',
        JSON.stringify({
          salarioBase: 0,
          tipoPago: 'mensual',
          antiguedad: '1_a_3',
          fechaIngreso: '',
        }),
      );

      render(<App />);

      expect(screen.queryByText('Resultado del Periodo')).not.toBeInTheDocument();
    });
  });
});
