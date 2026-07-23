import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { useCalculos } from './useCalculos';

function TestComponent() {
  const state = useCalculos();
  if (state.status === 'idle') return <div>idle</div>;
  if (state.status === 'success') return <div>success: ${state.data.neto.salarioLiquido.toFixed(2)}</div>;
  if (state.status === 'error') return <div>error: {state.error}</div>;
  return <div>loading</div>;
}

describe('useCalculos', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retorna idle cuando no hay salario', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>,
    );
    expect(screen.getByText('idle')).toBeInTheDocument();
  });

  it('retorna success con salario configurado', () => {
    localStorage.setItem('config-inicial', JSON.stringify({
      salarioBase: 800,
      tipoPago: 'mensual',
      antiguedad: '1_a_3',
      fechaIngreso: '2025-01-15',
    }));
    localStorage.setItem('jornada-config', JSON.stringify({
      tipo: 'tiempo_completo',
      horasSemanales: 44,
      modalidad: 'diurna',
    }));
    localStorage.setItem('registro-periodo', JSON.stringify([]));
    localStorage.setItem('incentivos', JSON.stringify([]));

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>,
    );
    expect(screen.getByText(/success:/)).toBeInTheDocument();
  });
});
