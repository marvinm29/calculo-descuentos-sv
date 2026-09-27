import { describe, it, expect, beforeEach, vi } from 'vitest';
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
      // La clave corrupta se elimina y el default se re-escribe (auto-sanado);
      // ningún dato imposible sobrevive.
      expect(localStorage.getItem('entradas-periodo')).toBe('[]');
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
    it('muestra feedback inline en filas con horas > 24 y las excluye del cálculo', async () => {
      const user = userEvent.setup();
      localStorage.setItem('config-inicial', JSON.stringify(CONFIG_VALIDA));

      render(<App />);

      const netoAntes = screen.getByTestId('neto-liquido').textContent;

      await user.click(screen.getByRole('button', { name: 'Agregar entrada' }));
      const horas = screen.getByLabelText('Horas diurnas');
      await user.type(horas, '30');

      // Feedback inline en la fila (Regla 4 en cliente), no un error genérico.
      expect(screen.getByRole('alert')).toHaveTextContent(
        /no pueden exceder 24/i,
      );
      // La fila inválida no alimenta el cálculo: el neto sigue siendo el base.
      expect(screen.getByTestId('neto-liquido').textContent).toBe(netoAntes);
    });
  });

  // ─── FE-08: orden DOM y foco, no trucos de CSS order ───
  describe('orden del resultado (FE-08)', () => {
    function columnas() {
      const main = screen.getByRole('main');
      const resultado = screen.getByText('Resultado del Periodo');
      const config = screen.getByText('Configuración Inicial');
      const colResultado = resultado.closest('main > div');
      const colFormulario = config.closest('main > div');
      expect(colResultado).not.toBeNull();
      expect(colFormulario).not.toBeNull();
      return { main, resultado, config, colResultado: colResultado!, colFormulario: colFormulario! };
    }

    it('el resultado precede a la captura en el DOM (móvil y foco)', () => {
      localStorage.setItem('config-inicial', JSON.stringify(CONFIG_VALIDA));
      render(<App />);

      const { main, colResultado, colFormulario } = columnas();
      // Hijos de main en orden DOM: resultado primero, formulario después.
      expect(main.children[0]).toBe(colResultado);
      expect(main.children[1]).toBe(colFormulario);
      // Orden DOM verificado de forma relativa (independiente del CSS):
      const posicion =
        colResultado.compareDocumentPosition(colFormulario);
      expect(posicion & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('en escritorio el formulario queda a la izquierda y el resultado a la derecha (grid, sin order)', () => {
      localStorage.setItem('config-inicial', JSON.stringify(CONFIG_VALIDA));
      render(<App />);

      const { colResultado, colFormulario } = columnas();
      // Colocación explícita de grid; sin clases order-* (prohibidas FE-08).
      expect(colResultado.className).toContain('lg:col-start-2');
      expect(colFormulario.className).toContain('lg:col-start-1');
      expect(colResultado.className).not.toMatch(/\border-\d\b/);
      expect(colFormulario.className).not.toMatch(/\border-\d\b/);
    });

    it('el primer elemento enfocable de main pertenece al resultado (teclado)', async () => {
      const user = userEvent.setup();
      localStorage.setItem('config-inicial', JSON.stringify(CONFIG_VALIDA));
      render(<App />);

      // Tab 1: toggle de tema en el header; Tab 2: primer enfocable de main.
      await user.tab();
      await user.tab();

      const { colResultado } = columnas();
      expect(document.activeElement).not.toBeNull();
      expect(colResultado.contains(document.activeElement)).toBe(true);
    });
  });

  describe('estado de persistencia (FE-15)', () => {
    it('muestra aviso accionable cuando la escritura en localStorage falla', async () => {
      const user = userEvent.setup();
      localStorage.setItem('config-inicial', JSON.stringify(CONFIG_VALIDA));
      const setItem = vi.spyOn(Storage.prototype, 'setItem');
      setItem.mockImplementation((key: string) => {
        if (key === 'entradas-periodo') {
          throw new Error('quota exceeded');
        }
      });

      render(<App />);
      await user.click(screen.getByRole('button', { name: 'Agregar entrada' }));

      expect(
        screen.getByText(/almacenamiento lleno o modo privado/i),
      ).toBeInTheDocument();

      setItem.mockRestore();
    });
  });

  describe('jornada retirada (2026-09-27)', () => {
    it('no renderiza la sección Jornada y limpia la clave muerta', () => {
      localStorage.setItem('jornada-config', JSON.stringify({ modalidad: 'diurna' }));
      render(<App />);

      expect(screen.queryByText('Jornada Laboral')).not.toBeInTheDocument();
      expect(screen.queryByText(/Modalidad registrada/)).not.toBeInTheDocument();
      expect(localStorage.getItem('jornada-config')).toBeNull();
    });
  });
});
