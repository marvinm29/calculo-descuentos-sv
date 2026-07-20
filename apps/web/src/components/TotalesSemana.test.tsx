import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TotalesSemana } from './TotalesSemana';
import { crearDiaVacio } from './registroTypes';

describe('TotalesSemana', () => {
  it('muestra 0h cuando no hay horas registradas', () => {
    const dias = [crearDiaVacio('2026-07-06')];
    render(<TotalesSemana dias={dias} />);
    expect(screen.getByText(/Diurna: 0h/)).toBeInTheDocument();
    expect(screen.getByText(/Nocturna: 0h/)).toBeInTheDocument();
  });

  it('suma horas diurna de todos los dias', () => {
    const dias = [
      { ...crearDiaVacio('2026-07-06'), horasDiurna: 8 },
      { ...crearDiaVacio('2026-07-07'), horasDiurna: 8 },
    ];
    render(<TotalesSemana dias={dias} />);
    expect(screen.getByText(/Diurna: 16h/)).toBeInTheDocument();
  });

  it('muestra separadas diurna y nocturna', () => {
    const dias = [
      {
        ...crearDiaVacio('2026-07-06'),
        horasDiurna: 8,
        horasNocturna: 2,
      },
    ];
    render(<TotalesSemana dias={dias} />);
    expect(screen.getByText(/Diurna: 8h/)).toBeInTheDocument();
    expect(screen.getByText(/Nocturna: 2h/)).toBeInTheDocument();
  });
});
