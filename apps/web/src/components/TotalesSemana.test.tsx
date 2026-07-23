import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TotalesSemana } from './TotalesSemana';
import { crearDiaVacio, crearBloque } from './registroTypes';

describe('TotalesSemana', () => {
  it('muestra 0h cuando no hay bloques', () => {
    const dias = [crearDiaVacio('2026-07-06')];
    render(<TotalesSemana dias={dias} />);
    expect(screen.getByText(/Diurnas: 0.0h/)).toBeInTheDocument();
    expect(screen.getByText(/Nocturnas: 0.0h/)).toBeInTheDocument();
  });

  it('suma horas de bloques de todos los días', () => {
    const dias = [
      {
        ...crearDiaVacio('2026-07-06'),
        bloques: [crearBloque('06:00', '14:00', 'base')],
      },
      {
        ...crearDiaVacio('2026-07-07'),
        bloques: [crearBloque('06:00', '14:00', 'base')],
      },
    ];
    render(<TotalesSemana dias={dias} />);
    expect(screen.getByText(/Diurnas: 16.0h/)).toBeInTheDocument();
  });

  it('incluye pausas si existen', () => {
    const dias = [
      {
        ...crearDiaVacio('2026-07-06'),
        bloques: [
          crearBloque('06:00', '14:00', 'base'),
          crearBloque('12:00', '13:00', 'pausa'),
        ],
      },
    ];
    render(<TotalesSemana dias={dias} />);
    expect(screen.getByText(/Diurnas: 8.0h/)).toBeInTheDocument();
    expect(screen.getByText(/Pausas: 1.0h/)).toBeInTheDocument();
  });
});
