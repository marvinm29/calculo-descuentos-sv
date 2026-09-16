import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResumenBruto } from './ResumenBruto';
import type { BrutoResponse } from '@calc/shared';

const brutoCompleto: BrutoResponse = {
  salarioBase: 400,
  horasExtraDiurna: 13.33,
  horasExtraNocturna: 15,
  diaLibreDiurna: 20,
  diaLibreNocturna: 8.75,
  asueto: 16,
  incentivos: 100,
  incentivosGravados: 100,
  brutoTotal: 573.08,
};

const brutoMinimo: BrutoResponse = {
  salarioBase: 400,
  horasExtraDiurna: 0,
  horasExtraNocturna: 0,
  diaLibreDiurna: 0,
  diaLibreNocturna: 0,
  asueto: 0,
  incentivos: 0,
  incentivosGravados: 0,
  brutoTotal: 400,
};

describe('ResumenBruto', () => {
  it('muestra todas las líneas cuando hay montos positivos', () => {
    render(<ResumenBruto bruto={brutoCompleto} />);
    expect(screen.getByText('Horas extra diurna')).toBeInTheDocument();
    expect(screen.getByText('Horas extra nocturna')).toBeInTheDocument();
    expect(screen.getByText('Día libre diurna')).toBeInTheDocument();
    expect(screen.getByText('Día libre nocturna')).toBeInTheDocument();
    expect(screen.getByText('Asueto')).toBeInTheDocument();
    expect(screen.getByText('Incentivos')).toBeInTheDocument();
    expect(screen.getByText('$573.08')).toBeInTheDocument();
  });

  it('oculta las líneas en cero y muestra solo salario base y total', () => {
    render(<ResumenBruto bruto={brutoMinimo} />);
    expect(screen.queryByText('Horas extra diurna')).not.toBeInTheDocument();
    expect(screen.queryByText('Incentivos')).not.toBeInTheDocument();
    expect(screen.getByText('Salario base del periodo')).toBeInTheDocument();
    expect(screen.getByText('Total bruto')).toBeInTheDocument();
  });
});
