import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExportarPDF } from './ExportarPDF';

describe('ExportarPDF', () => {
  it('renderiza boton de imprimir', () => {
    render(<ExportarPDF />);
    expect(
      screen.getByText('Imprimir / Exportar PDF'),
    ).toBeInTheDocument();
  });
});
