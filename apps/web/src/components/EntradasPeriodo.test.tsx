import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  EntradasPeriodo,
  segmentosProyectados,
  validarFila,
} from './EntradasPeriodo';
import type { EntradaPeriodo } from '@calc/shared';

const entry: EntradaPeriodo = {
  id: 'ent-1',
  fecha: '2026-07-01',
  tipo: 'extra',
  horasDiurnas: 2,
  horasNocturnas: 1,
};

describe('EntradasPeriodo', () => {
  it('muestra mensaje vacio cuando no hay entradas', () => {
    render(<EntradasPeriodo entradas={[]} onChange={() => {}} />);
    expect(
      screen.getByText('No hay entradas registradas. Agregá una para empezar.'),
    ).toBeInTheDocument();
  });

  it('agrega una entrada al hacer clic en Agregar entrada', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EntradasPeriodo entradas={[]} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Agregar entrada' }));
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        tipo: 'extra',
        horasDiurnas: 0,
        horasNocturnas: 0,
      }),
    ]);
  });

  it('renderiza entradas existentes', () => {
    render(<EntradasPeriodo entradas={[entry]} onChange={() => {}} />);
    expect(screen.getByDisplayValue('2026-07-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
  });

  it('actualiza fecha al cambiar el date input', () => {
    const onChange = vi.fn();
    render(<EntradasPeriodo entradas={[entry]} onChange={onChange} />);

    fireEvent.change(screen.getByDisplayValue('2026-07-01'), {
      target: { value: '2026-07-15' },
    });

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ fecha: '2026-07-15' }),
    ]);
  });

  it('actualiza horas diurnas al cambiar el input', () => {
    const onChange = vi.fn();
    render(<EntradasPeriodo entradas={[entry]} onChange={onChange} />);

    fireEvent.change(screen.getByDisplayValue('2'), {
      target: { value: '5' },
    });

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ horasDiurnas: 5 }),
    ]);
  });

  it('actualiza horas nocturnas al cambiar el input', () => {
    const onChange = vi.fn();
    render(<EntradasPeriodo entradas={[entry]} onChange={onChange} />);

    fireEvent.change(screen.getByDisplayValue('1'), {
      target: { value: '3' },
    });

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ horasNocturnas: 3 }),
    ]);
  });

  it('cambia tipo al seleccionar otra opcion', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EntradasPeriodo entradas={[entry]} onChange={onChange} />);

    await user.selectOptions(screen.getByRole('combobox'), 'asueto');

    const lastCall = onChange.mock.calls.at(-1)?.[0] as EntradaPeriodo[];
    expect(lastCall[0]?.tipo).toBe('asueto');
  });

  it('elimina una entrada al hacer clic en Eliminar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EntradasPeriodo entradas={[entry]} onChange={onChange} />);

    await user.click(screen.getAllByText('Eliminar')[0]!);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('muestra factor del tipo de la ultima entrada', () => {
    const lastEntry: EntradaPeriodo = {
      id: 'ent-2',
      fecha: '2026-07-02',
      tipo: 'asueto',
      horasDiurnas: 8,
      horasNocturnas: 0,
    };
    render(<EntradasPeriodo entradas={[entry, lastEntry]} onChange={() => {}} />);
    expect(screen.getByText(/Factor: 2\.00x/)).toBeInTheDocument();
  });

  // ─── FE-03: límite sobre segmentos proyectados, no filas ───
  describe('segmentosProyectados (FE-03)', () => {
    it('cuenta 2 segmentos para una fila mixta extra', () => {
      expect(segmentosProyectados([entry])).toBe(2); // diurna 2h + nocturna 1h
    });

    it('cuenta 1 segmento para asueto y filas de una sola franja', () => {
      const asueto: EntradaPeriodo = { ...entry, id: 'e2', tipo: 'asueto', horasNocturnas: 0 };
      const soloNocturna: EntradaPeriodo = { ...entry, id: 'e3', horasDiurnas: 0 };
      expect(segmentosProyectados([asueto])).toBe(1);
      expect(segmentosProyectados([soloNocturna])).toBe(1);
    });

    it('ignora filas vacías y fechas imposibles', () => {
      const vacia: EntradaPeriodo = { ...entry, id: 'e4', horasDiurnas: 0, horasNocturnas: 0 };
      const imposible: EntradaPeriodo = { ...entry, id: 'e5', fecha: '2026-02-30' };
      expect(segmentosProyectados([vacia, imposible])).toBe(0);
    });

    it('50 filas mixtas (100 segmentos) alcanzan el límite y bloquean el botón', () => {
      const mixtas = Array.from({ length: 50 }, (_, i) => ({
        id: `m${i}`,
        fecha: '2026-07-01',
        tipo: 'extra' as const,
        horasDiurnas: 0.5,
        horasNocturnas: 0.5,
      }));
      // 50 filas mixtas = 100 segmentos → límite alcanzado.
      // Timeout ampliado: render de 50 filas es lento bajo coverage.
      render(<EntradasPeriodo entradas={mixtas} onChange={() => {}} />);
      expect(
        screen.getByText(/Segmentos proyectados: 100 \/ 100/),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Agregar entrada' })).toBeDisabled();
    }, 15000);

    it('49 filas mixtas (98 segmentos) no alcanzan el límite; agregar habilitado', () => {
      const mixtas = Array.from({ length: 49 }, (_, i) => ({
        id: `m${i}`,
        fecha: '2026-07-01',
        tipo: 'extra' as const,
        horasDiurnas: 0.5,
        horasNocturnas: 0.5,
      }));
      render(<EntradasPeriodo entradas={mixtas} onChange={() => {}} />);
      expect(
        screen.getByText(/Segmentos proyectados: 98 \/ 100/),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Agregar entrada' })).toBeEnabled();
    });
  });

  // ─── FE-03 (2026-09-20): el límite cubre la EDICIÓN de filas existentes ───
  describe('límite al editar el estado candidato (FE-03)', () => {
    function filaSimple(i: number): EntradaPeriodo {
      return {
        id: `s${i}`,
        fecha: '2026-07-01',
        tipo: 'extra',
        horasDiurnas: 0.5,
        horasNocturnas: 0,
      };
    }

    it('99 → 100 segmentos: editar la última fila a mixta se permite', () => {
      const onChange = vi.fn();
      // 49 mixtas (98 segmentos) + 1 simple (1) = 50 filas, 99 segmentos.
      const filas = [
        ...Array.from({ length: 49 }, (_, i) => ({
          id: `m${i}`,
          fecha: '2026-07-01',
          tipo: 'extra' as const,
          horasDiurnas: 0.5,
          horasNocturnas: 0.5,
        })),
        filaSimple(49),
      ];
      expect(
        filas.reduce(
          (s, f) => s + (f.horasNocturnas > 0 ? 2 : 1),
          0,
        ),
      ).toBe(99);

      render(<EntradasPeriodo entradas={filas} onChange={onChange} />);
      // La fila simple es la última: agregar nocturnas la vuelve mixta (2 segs).
      const nocturnas = screen.getAllByLabelText('Horas nocturnas').at(-1)!;
      fireEvent.change(nocturnas, { target: { value: '0.5' } });

      expect(onChange).toHaveBeenCalled();
      const candidatas = onChange.mock.calls.at(-1)?.[0] as EntradaPeriodo[];
      expect(
        candidatas.reduce((s, f) => s + (f.horasNocturnas > 0 ? 2 : 1), 0),
      ).toBe(100);
      expect(
        screen.getByText(/Segmentos proyectados: 99 \/ 100/),
      ).toBeInTheDocument();
    }, 20000);

    it('100 → 101 segmentos: editar una fila con fecha inválida a válida se bloquea', () => {
      const onChange = vi.fn();
      // 50 mixtas = 100 segmentos; la fila 51 tiene fecha imposible, así que
      // no proyecta segmentos (el usuario la arregla: 1 → 2 segmentos reales).
      const mixtas = Array.from({ length: 50 }, (_, i) => ({
        id: `m${i}`,
        fecha: '2026-07-01',
        tipo: 'extra' as const,
        horasDiurnas: 0.5,
        horasNocturnas: 0.5,
      }));
      const rota: EntradaPeriodo = {
        id: 'rota',
        fecha: '2026-02-30', // imposible
        tipo: 'extra',
        horasDiurnas: 0.5,
        horasNocturnas: 0,
      };
      render(<EntradasPeriodo entradas={[...mixtas, rota]} onChange={onChange} />);
      expect(
        screen.getByText(/Segmentos proyectados: 100 \/ 100/),
      ).toBeInTheDocument();

      // Editar la fecha de la fila rota a una válida proyectaría 101 → bloqueado.
      const fechas = screen.getAllByLabelText('Fecha');
      fireEvent.change(fechas.at(-1)!, { target: { value: '2026-07-02' } });

      expect(onChange).not.toHaveBeenCalled();
      expect(
        screen.getByText(/superaría el límite de 100 segmentos proyectados/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Segmentos proyectados: 100 \/ 100/),
      ).toBeInTheDocument();
    }, 20000);

    it('asueto al límite: la conversión a extra mixto se bloquea al exceder', async () => {
      const user = userEvent.setup();
      const mixtas = Array.from({ length: 49 }, (_, i) => ({
        id: `m${i}`,
        fecha: '2026-07-01',
        tipo: 'extra' as const,
        horasDiurnas: 0.5,
        horasNocturnas: 0.5,
      }));
      const asueto1: EntradaPeriodo = {
        id: 'a1',
        fecha: '2026-08-05',
        tipo: 'asueto',
        horasDiurnas: 1,
        horasNocturnas: 0,
      };
      const asueto2: EntradaPeriodo = {
        id: 'a2',
        fecha: '2026-08-06',
        tipo: 'asueto',
        horasDiurnas: 1,
        horasNocturnas: 0,
      };
      // 98 (mixtas) + 1 + 1 (asuetos) = 100 segmentos. Harness controlado:
      // el onChange actualiza el estado real que el componente recibe.
      function Contenedor() {
        const [filas, setFilas] = useState<EntradaPeriodo[]>([
          ...mixtas,
          asueto1,
          asueto2,
        ]);
        return <EntradasPeriodo entradas={filas} onChange={setFilas} />;
      }
      render(<Contenedor />);
      expect(
        screen.getByText(/Segmentos proyectados: 100 \/ 100/),
      ).toBeInTheDocument();

      // Paso 1: asueto2 → extra (sigue proyectando 1 segmento): permitido.
      const tipos = screen.getAllByLabelText('Tipo');
      await user.selectOptions(tipos.at(-1)!, 'extra');
      expect(
        screen.getByText(/Segmentos proyectados: 100 \/ 100/),
      ).toBeInTheDocument();

      // Paso 2: sumar nocturnas convertiría la fila en mixta (2 segmentos) →
      // 101 proyectados: el estado candidato excede el límite y se bloquea.
      const nocturnas = screen.getAllByLabelText('Horas nocturnas');
      fireEvent.change(nocturnas.at(-1)!, { target: { value: '0.5' } });

      expect(
        screen.getByText(/superaría el límite de 100 segmentos proyectados/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Segmentos proyectados: 100 \/ 100/),
      ).toBeInTheDocument();
    }, 20000);

    it('editar fechas a inválidas muestra error y reduce la proyección (onChange aplicado)', () => {
      // Harness controlado: el componente real recibe el estado que emite.
      function Contenedor() {
        const [filas, setFilas] = useState<EntradaPeriodo[]>([entry]);
        return <EntradasPeriodo entradas={filas} onChange={setFilas} />;
      }
      render(<Contenedor />);

      const fecha = screen.getByLabelText('Fecha');
      fireEvent.change(fecha, { target: { value: '2026-02-30' } });

      // La fila con fecha imposible no proyecta segmentos: el cambio se aplica
      // y la fila muestra su error inline (la UI no alimenta el cálculo).
      expect(screen.getByRole('alert')).toHaveTextContent('Fecha inválida');
      // jsdom sanitiza el value del input date para fechas imposibles (queda
      // vacío); el estado candidato recibe ese string y sigue siendo inválido.
      expect(screen.getByLabelText('Fecha')).toHaveValue('');
      expect(
        screen.getByText(/Segmentos proyectados: 0 \/ 100/),
      ).toBeInTheDocument();
    });
  });

  // ─── FE-06: error asociado a los campos causantes ───
  it('asocia el error de fecha solo al campo fecha y lo describe', () => {
    const malaFecha: EntradaPeriodo = { ...entry, fecha: '2026-02-30' };
    render(<EntradasPeriodo entradas={[malaFecha]} onChange={() => {}} />);

    const fechaInput = screen.getByLabelText('Fecha');
    expect(fechaInput).toHaveAttribute('aria-invalid', 'true');
    expect(fechaInput).toHaveAttribute('aria-describedby', `error-${malaFecha.id}`);
    expect(screen.getByLabelText('Horas diurnas')).toHaveAttribute(
      'aria-invalid',
      'false',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Fecha inválida');
  });

  it('validarFila asocia errores de horas a los campos de horas', () => {
    const exceso: EntradaPeriodo = { ...entry, horasDiurnas: 25 };
    const error = validarFila(exceso, [exceso]);
    expect(error?.campos).toEqual(['horas']);
    expect(error?.mensaje).toMatch(/exceder 24/);
  });

  // ─── Regla 4 en cliente: NaN, ±Infinity, negativos, fuera de rango ───
  describe('validarFila numérica (Regla 4 en cliente, 2026-09-20)', () => {
    it('rechaza NaN en horas', () => {
      const error = validarFila({ ...entry, horasDiurnas: NaN }, [entry]);
      expect(error?.mensaje).toMatch(/número finito/i);
      expect(error?.campos).toEqual(['horas']);
    });

    it('rechaza Infinity y -Infinity', () => {
      expect(validarFila({ ...entry, horasDiurnas: Infinity }, [entry])?.mensaje).toMatch(
        /número finito/i,
      );
      expect(validarFila({ ...entry, horasNocturnas: -Infinity }, [entry])?.mensaje).toMatch(
        /número finito/i,
      );
    });

    it('rechaza horas negativas', () => {
      const error = validarFila({ ...entry, horasNocturnas: -1 }, [entry]);
      expect(error?.mensaje).toMatch(/negativas/);
      expect(error?.campos).toEqual(['horas']);
    });

    it('rechaza valores fuera de rango (> 24) por campo', () => {
      expect(validarFila({ ...entry, horasDiurnas: 24.5 }, [entry])?.mensaje).toMatch(
        /exceder 24/,
      );
      expect(validarFila({ ...entry, horasNocturnas: 25 }, [entry])?.mensaje).toMatch(
        /exceder 24/,
      );
    });

    it('acepta horas en rango válido', () => {
      expect(validarFila(entry, [entry])).toBeNull();
      expect(validarFila({ ...entry, horasDiurnas: 24, horasNocturnas: 0 }, [entry])).toBeNull();
    });
  });
});
