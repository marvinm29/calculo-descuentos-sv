import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { NetoLiquido } from './NetoLiquido';

// FE-18: el anuncio a lectores de pantalla solo ocurre cuando el valor se
// estabiliza (debounce), no en cada pulsación de tecla.
function liveRegion(container: HTMLElement): string {
  const el = container.querySelector('[aria-live="polite"]');
  return el?.textContent ?? '';
}

describe('NetoLiquido (FE-18)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra la cifra visible inmediatamente, sin role="status" por tecla', () => {
    const { container } = render(<NetoLiquido neto={100} />);
    const cifra = screen.getByTestId('neto-liquido');
    expect(cifra).toHaveTextContent('$100.00');
    expect(cifra).not.toHaveAttribute('role', 'status');
    expect(container.querySelector('[aria-live="polite"]')).not.toBeNull();
  });

  it('anuncia el valor solo cuando se estabiliza (debounce 800 ms)', () => {
    vi.useFakeTimers();
    const { rerender, container } = render(<NetoLiquido neto={100} />);

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(liveRegion(container)).toContain('$100.00');

    // El usuario sigue tecleando: el valor cambia a 200
    rerender(<NetoLiquido neto={200} />);
    act(() => {
      vi.advanceTimersByTime(799);
    });
    // Aún no se estabiliza: el anuncio conserva el valor anterior
    expect(liveRegion(container)).toContain('$100.00');
    expect(liveRegion(container)).not.toContain('$200.00');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(liveRegion(container)).toContain('$200.00');
  });
});
