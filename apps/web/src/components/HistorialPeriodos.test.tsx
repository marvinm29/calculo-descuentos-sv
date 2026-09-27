import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistorialPeriodos } from './HistorialPeriodos';
import type { CalculoState, CalcularRequest } from '@calc/shared';

const dummyRequest: CalcularRequest = {
  salarioBase: 800,
  tipoPago: 'mensual',
  fechaInicio: '2026-07-01',
  fechaFin: '2026-07-31',
  antiguedad: '1_a_3',
  fechaIngreso: '2025-01-15',
  segmentos: [],
};

const successState: CalculoState = {
  status: 'success',
  request: dummyRequest,
  data: {
    bruto: {
      salarioBase: 800,
      horasExtraDiurna: 0,
      horasExtraNocturna: 0,
      diaLibreDiurna: 0,
      diaLibreNocturna: 0,
      asueto: 0,
      incentivos: 0,
      incentivosGravados: 0,
      brutoTotal: 800,
    },
    descuentos: {
      isss: { porcentaje: 3, salarioAsegurable: 800, descuento: 24 },
      afp: { porcentaje: 7.25, salarioCotizable: 800, descuento: 58 },
      renta: {
        baseGravable: 718,
        tramo: 2,
        porcentajeExceso: 10,
        cuotaFija: 17.67,
        descuento: 55.6,
      },
      totalDescuentos: 137.6,
    },
    prestaciones: {
      aguinaldo: { dias: 15, monto: 400, proporcional: false },
      vacaciones: { porcentaje: 30, monto: 120 },
      quincena25: null,
    },
    neto: { salarioLiquido: 662.4 },
  },
};

describe('HistorialPeriodos', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muestra mensaje vacio cuando no hay periodos', () => {
    render(
      <HistorialPeriodos calculoState={successState} />,
    );
    expect(
      screen.getByText(/No hay periodos guardados/),
    ).toBeInTheDocument();
  });

  it('guarda un periodo y lo muestra en la lista', async () => {
    const user = userEvent.setup();
    render(
      <HistorialPeriodos calculoState={successState} />,
    );

    await user.click(
      screen.getByRole('button', { name: /Guardar periodo/ }),
    );

    expect(screen.getByText(/\$662\.40/)).toBeInTheDocument();
    expect(screen.getByText(/Bruto: \$800\.00/)).toBeInTheDocument();
  });

  it('guarda multiples periodos', async () => {
    const user = userEvent.setup();
    render(
      <HistorialPeriodos calculoState={successState} />,
    );

    await user.click(
      screen.getByRole('button', { name: /Guardar periodo/ }),
    );
    await user.click(
      screen.getByRole('button', { name: /Guardar periodo/ }),
    );

    const items = screen.getAllByText(/Bruto:/);
    expect(items.length).toBe(2);
  });

  it('elimina un periodo guardado', async () => {
    const user = userEvent.setup();
    render(
      <HistorialPeriodos calculoState={successState} />,
    );

    await user.click(
      screen.getByRole('button', { name: /Guardar periodo/ }),
    );
    expect(screen.getByText(/\$662\.40/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Eliminar/ }));
    expect(screen.getByText(/No hay periodos guardados/)).toBeInTheDocument();
  });

  // ─── FE-02: historial corrupto se descarta sin romper el árbol ───
  it('descarta JSON corrupto, avisa y arranca con historial vacío', () => {
    localStorage.setItem('historial-periodos', '{"id":"x"'); // JSON inválido
    render(<HistorialPeriodos calculoState={successState} />);

    expect(
      screen.getByText(/estaba corrupto y se restableció/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/No hay periodos guardados/)).toBeInTheDocument();
    // La clave corrupta se elimina y el default ([]) se re-escribe (auto-sanado
    // por el efecto de sincronización; persistencia.md § Mecánica, 2026-09-20).
    expect(localStorage.getItem('historial-periodos')).toBe('[]');
  });

  it('descarta forma parcial (tipos incorrectos, NaN serializado, campos extra)', () => {
    const corruptas = [
      '[{"id":"a","fecha":"2026-01-01T00:00:00.000Z","neto":"abc","brutoTotal":10}]',
      '[{"id":"a","fecha":"2026-01-01T00:00:00.000Z","neto":null,"brutoTotal":10}]',
      '[{"id":"a","fecha":"2026-01-01T00:00:00.000Z","neto":10,"brutoTotal":10,"extra":1}]',
      'NaN',
    ];
    for (const raw of corruptas) {
      localStorage.setItem('historial-periodos', raw);
      const { unmount } = render(
        <HistorialPeriodos calculoState={successState} />,
      );
      expect(
        screen.getByText(/estaba corrupto y se restableció/i),
      ).toBeInTheDocument();
      unmount();
      localStorage.clear();
    }
  });

  // ─── `fecha` = timestamp ISO UTC canónico (2026-09-20) ───
  it('descarta entradas con fecha arbitraria y muestra el aviso', () => {
    localStorage.setItem(
      'historial-periodos',
      JSON.stringify([{ id: 'a', fecha: 'ayer por la tarde', neto: 1, brutoTotal: 2 }]),
    );
    render(<HistorialPeriodos calculoState={successState} />);

    expect(
      screen.getByText(/estaba corrupto y se restableció/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/No hay periodos guardados/)).toBeInTheDocument();
  });

  it('guarda con timestamp ISO UTC canónico compatible con toISOString()', async () => {
    const user = userEvent.setup();
    render(<HistorialPeriodos calculoState={successState} />);
    await user.click(screen.getByRole('button', { name: /Guardar periodo/ }));

    const guardado = JSON.parse(
      localStorage.getItem('historial-periodos')!,
    ) as { fecha: string }[];
    expect(guardado).toHaveLength(1);
    expect(guardado[0]?.fecha).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
    // Roundtrip: el string guardado es exactamente lo que produce toISOString().
    expect(new Date(guardado[0]!.fecha).toISOString()).toBe(guardado[0]!.fecha);
  });

  it('acepta historial válido y lo muestra', () => {
    localStorage.setItem(
      'historial-periodos',
      JSON.stringify([
        {
          id: 'p1',
          fecha: '2026-01-15T12:00:00.000Z',
          neto: 662.4,
          brutoTotal: 800,
        },
      ]),
    );
    render(<HistorialPeriodos calculoState={successState} />);
    expect(screen.getByText(/\$662\.40/)).toBeInTheDocument();
  });

  // ─── FE-16: retención máxima 50 con recorte FIFO ───
  it('recorta el periodo más antiguo al exceder 50 (FIFO)', async () => {
    const previos = Array.from({ length: 50 }, (_, i) => ({
      id: `p${i}`,
      fecha: '2026-01-15T12:00:00.000Z',
      neto: 100 + i,
      brutoTotal: 200,
    }));
    localStorage.setItem('historial-periodos', JSON.stringify(previos));

    const user = userEvent.setup();
    render(<HistorialPeriodos calculoState={successState} />);
    await user.click(
      screen.getByRole('button', { name: /Guardar periodo/ }),
    );

    const guardado = JSON.parse(
      localStorage.getItem('historial-periodos')!,
    ) as { id: string; neto: number }[];
    expect(guardado).toHaveLength(50);
    expect(guardado[0]?.id).toBe('p1'); // p0 recortado
    expect(guardado[49]?.neto).toBe(662.4); // el nuevo al final
  });
});
