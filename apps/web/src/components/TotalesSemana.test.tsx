import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TotalesSemana } from './TotalesSemana';
import { crearDiaVacio } from './registroTypes';

describe('TotalesSemana', () => {
  it('muestra 0h cuando no hay horas registradas', () => {
    const dias = [crearDiaVacio('2026-07-06')];
    render(<TotalesSemana dias={dias} />);
    expect(screen.getByText(/Diurnas: 0h/)).toBeInTheDocument();
    expect(screen.getByText(/Nocturnas: 0h/)).toBeInTheDocument();
  });

  it('suma horas diurnas de todos los dias', () => {
    const dias = [
      { ...crearDiaVacio('2026-07-06'), horasDiurnas: 8 },
      { ...crearDiaVacio('2026-07-07'), horasDiurnas: 8 },
    ];
    render(<TotalesSemana dias={dias} />);
    expect(screen.getByText(/Diurnas: 16h/)).toBeInTheDocument();
  });

  it('muestra separadas diurnas y nocturnas', () => {
    const dias = [
      {
        ...crearDiaVacio('2026-07-06'),
        horasDiurnas: 8,
        horasNocturnas: 2,
      },
    ];
    render(<TotalesSemana dias={dias} />);
    expect(screen.getByText(/Diurnas: 8h/)).toBeInTheDocument();
    expect(screen.getByText(/Nocturnas: 2h/)).toBeInTheDocument();
  });
});
