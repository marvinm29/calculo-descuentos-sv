import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TotalesSemana } from './TotalesSemana';
import { crearDiaVacio } from './registroTypes';

describe('TotalesSemana', () => {
  it('muestra 0h cuando no hay horas registradas', () => {
    const dias = [crearDiaVacio('2026-07-06')];
    render(<TotalesSemana dias={dias} />);
    expect(screen.getByText(/Base: 0h/)).toBeInTheDocument();
  });

  it('suma horas base de todos los dias', () => {
    const dias = [
      { ...crearDiaVacio('2026-07-06'), horasBase: 8 },
      { ...crearDiaVacio('2026-07-07'), horasBase: 8 },
    ];
    render(<TotalesSemana dias={dias} />);
    expect(screen.getByText(/Base: 16h/)).toBeInTheDocument();
  });

  it('muestra extras separadas', () => {
    const dias = [
      {
        ...crearDiaVacio('2026-07-06'),
        horasBase: 8,
        horasExtraDiurna: 2,
        horasExtraNocturna: 1,
      },
    ];
    render(<TotalesSemana dias={dias} />);
    expect(screen.getByText(/Extra D: 2h/)).toBeInTheDocument();
    expect(screen.getByText(/Extra N: 1h/)).toBeInTheDocument();
  });
});
