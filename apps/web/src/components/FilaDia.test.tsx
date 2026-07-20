import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilaDia } from './FilaDia';
import { crearDiaVacio, crearBloque } from './registroTypes';

const diaVacio = crearDiaVacio('2026-07-06');

describe('FilaDia', () => {
  it('muestra el nombre del día, la fecha y contadores en 0', () => {
    render(<FilaDia dia={diaVacio} onChange={() => {}} />);

    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('2026-07-06')).toBeInTheDocument();
    expect(screen.getByText(/0.0h D/)).toBeInTheDocument();
    expect(screen.getByText(/0.0h N/)).toBeInTheDocument();
  });

  it('botón Agregar bloque aparece y se puede hacer clic', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilaDia dia={diaVacio} onChange={onChange} />);

    const btn = screen.getByText('+ Agregar bloque');
    await user.click(btn);

    expect(onChange).toHaveBeenCalledOnce();
  });

  it('muestra un bloque existente con sus campos', () => {
    const dia = {
      ...diaVacio,
      bloques: [crearBloque('06:00', '14:00', 'base')],
    };
    render(<FilaDia dia={dia} onChange={() => {}} />);

    expect(screen.getByDisplayValue('06:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('14:00')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Base' })).toBeInTheDocument();
  });
});
