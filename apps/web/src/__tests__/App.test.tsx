import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';

const CONFIG_VALIDA = {
  salarioBase: 800,
  tipoPago: 'mensual',
  antiguedad: '1_a_3',
  fechaIngreso: '2020-01-01',
};

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

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
      localStorage.setItem('config-inicial', JSON.stringify(CONFIG_VALIDA));

      render(<App />);

      expect(screen.getByText('Resultado del Periodo')).toBeInTheDocument();
    });

    it('se mantiene sin resultado cuando el salario base es 0', () => {
      localStorage.setItem(
        'config-inicial',
        JSON.stringify({ ...CONFIG_VALIDA, salarioBase: 0 }),
      );

      render(<App />);

      expect(screen.queryByText('Resultado del Periodo')).not.toBeInTheDocument();
    });
  });

  describe('persistencia corrupta (Regla 8 — integridad)', () => {
    it('descarta entradas corruptas, muestra aviso y elimina la clave', () => {
      localStorage.setItem('config-inicial', JSON.stringify(CONFIG_VALIDA));
      localStorage.setItem(
        'entradas-periodo',
        JSON.stringify([{ id: 'x', fecha: 'imposible', tipo: 'otro' }]),
      );

      render(<App />);

      expect(screen.getByRole('alert')).toHaveTextContent(
        /descartaron datos guardados corruptos/i,
      );
      expect(screen.getByRole('alert')).toHaveTextContent('entradas-periodo');
      expect(localStorage.getItem('entradas-periodo')).toBeNull();
      // El cálculo sigue funcionando con defaults
      expect(screen.getByText('Resultado del Periodo')).toBeInTheDocument();
    });

    it('elimina claves muertas del modelo semanal viejo (migración)', () => {
      localStorage.setItem('registro-periodo', '[1,2,3]');
      localStorage.setItem('registro-semanal', '[]');

      render(<App />);

      expect(localStorage.getItem('registro-periodo')).toBeNull();
      expect(localStorage.getItem('registro-semanal')).toBeNull();
    });
  });

  describe('filas vacías no alteran el resultado (Regla 7)', () => {
    it('agregar una fila vacía no cambia el neto', async () => {
      const user = userEvent.setup();
      localStorage.setItem('config-inicial', JSON.stringify(CONFIG_VALIDA));
      localStorage.setItem(
        'entradas-periodo',
        JSON.stringify([
          {
            id: 'e1',
            fecha: new Date().toISOString().slice(0, 10),
            tipo: 'extra',
            horasDiurnas: 2,
            horasNocturnas: 0,
          },
        ]),
      );

      render(<App />);

      const neto = screen.getByTestId('neto-liquido');
      const netoAntes = neto.textContent;

      await user.click(screen.getByRole('button', { name: 'Agregar entrada' }));

      expect(screen.getByTestId('neto-liquido').textContent).toBe(netoAntes);
    });
  });

  describe('validación de entradas inválidas (Reglas 1 y 3)', () => {
    it('muestra feedback en filas con horas que exceden 24 y no las calcula', async () => {
      const user = userEvent.setup();
      localStorage.setItem('config-inicial', JSON.stringify(CONFIG_VALIDA));

      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Agregar entrada' }));
      const horas = screen.getByLabelText('Horas diurnas');
      await user.type(horas, '30');

      expect(screen.getByRole('alert')).toHaveTextContent(
        /no pueden exceder 24/i,
      );
      // Estado de error visible, no un resultado fabricado
      expect(screen.queryByTestId('neto-liquido')).not.toBeInTheDocument();
    });
  });
});
