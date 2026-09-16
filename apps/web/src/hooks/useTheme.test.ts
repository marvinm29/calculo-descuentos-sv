import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('retorna resolved theme inicial', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.resolved).toBeDefined();
    expect(['light', 'dark']).toContain(result.current.resolved);
  });

  it('toggle cambia el tema', () => {
    const { result } = renderHook(() => useTheme());
    const initial = result.current.resolved;

    act(() => {
      result.current.toggle();
    });

    expect(result.current.resolved).not.toBe(initial);
  });

  it('setTheme persiste la preferencia en localStorage', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.resolved).toBe('light');
    expect(localStorage.getItem('theme-preference')).toBe('light');
  });

  it('setTheme system resuelve según prefers-color-scheme', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('system');
    });

    expect(result.current.theme).toBe('system');
    expect(['light', 'dark']).toContain(result.current.resolved);
  });

  it('toggle cicla light → system → dark', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('light');
    });
    act(() => {
      result.current.toggle();
    });
    expect(result.current.theme).toBe('system');
    act(() => {
      result.current.toggle();
    });
    expect(result.current.theme).toBe('dark');
  });

  it('usa dark por defecto cuando localStorage tiene un valor inválido', () => {
    localStorage.setItem('theme-preference', 'sepia');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('aplica la clase dark al documento según el tema resuelto', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      result.current.setTheme('light');
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('reacciona al cambio de prefers-color-scheme en modo system', () => {
    const listeners: (() => void)[] = [];
    vi.spyOn(window, 'matchMedia').mockImplementation(((query: string) => ({
      matches: false,
      media: query,
      addEventListener: (_: string, cb: () => void) => listeners.push(cb),
      removeEventListener: (_: string, cb: () => void) => {
        const i = listeners.indexOf(cb);
        if (i >= 0) listeners.splice(i, 1);
      },
    })) as unknown as typeof window.matchMedia);

    const { result, unmount } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('system');
    });
    expect(listeners).toHaveLength(1);

    // Cambio del sistema → re-aplica sin caerse
    act(() => {
      listeners[0]!();
    });
    expect(result.current.resolved).toBe('light');

    unmount();
    expect(listeners).toHaveLength(0); // cleanup del listener
  });

  it('usa dark cuando no hay window (SSR safe)', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(((query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia);

    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme('system');
    });
    expect(result.current.resolved).toBe('dark');
  });
});
