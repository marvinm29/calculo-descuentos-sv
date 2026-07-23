import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TotalesPeriodo } from './TotalesPeriodo';
import type { JornadaConfig, SemanaRegistro } from '@calc/shared';

const diurnaCompleta: JornadaConfig = {
  tipo: 'tiempo_completo',
  horasSemanales: 44,
  modalidad: 'diurna',
};

describe('TotalesPeriodo', () => {
  it('muestra 0 semanas cuando el array esta vacio', () => {
    render(<TotalesPeriodo jornada={diurnaCompleta} semanas={[]} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('suma correctamente multiples semanas', () => {
    const semanas: SemanaRegistro[] = [
      {
        horasBaseNocturnas: 5,
        extraDiurna: 2,
        extraNocturna: 0,
        diaLibreDiurna: 0,
        diaLibreNocturna: 0,
        asueto: 0,
      },
      {
        horasBaseNocturnas: 3,
        extraDiurna: 1,
        extraNocturna: 0,
        diaLibreDiurna: 0,
        diaLibreNocturna: 0,
        asueto: 0,
      },
    ];
    render(
      <TotalesPeriodo jornada={diurnaCompleta} semanas={semanas} />,
    );
    expect(screen.getByText(/8\.0h/)).toBeInTheDocument();
    expect(screen.getByText(/3\.0h/)).toBeInTheDocument();
  });
});
