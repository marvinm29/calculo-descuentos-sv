import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistorialPeriodos } from './HistorialPeriodos';
import type { CalculoState } from '@calc/shared';

const successState: CalculoState = {
  status: 'success',
  data: {
    bruto: {
      salarioBase: 800,
      horasExtraDiurna: 0,
      horasExtraNocturna: 0,
      diaLibreDiurna: 0,
      diaLibreNocturna: 0,
      asueto: 0,
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
});
