import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { StrictMode } from 'react';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'test-key';

describe('useLocalStorage', () => {
  it('retorna el valor inicial cuando no hay dato guardado', () => {
    const { result } = renderHook(() =>
      useLocalStorage(STORAGE_KEY, 'default'),
    );
    expect(result.current[0]).toBe('default');
  });

  it('sincroniza el valor inicial en el primer render (efecto de escritura)', () => {
    renderHook(() => useLocalStorage(STORAGE_KEY, 'default'));
    expect(localStorage.getItem(STORAGE_KEY)).toBe('"default"');
  });

  it('persiste y recupera valores de localStorage', () => {
    const { result } = renderHook(() =>
      useLocalStorage(STORAGE_KEY, 0),
    );

    act(() => {
      result.current[1](42);
    });

    expect(result.current[0]).toBe(42);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('42');
  });

  it('recupera valores previamente guardados en localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: 1 }));

    const { result } = renderHook(() =>
      useLocalStorage<{ a: number }>(STORAGE_KEY, { a: 0 }),
    );

    expect(result.current[0]).toEqual({ a: 1 });
  });

  it('soporta setter funcional (prev => next)', () => {
    const { result } = renderHook(() =>
      useLocalStorage(STORAGE_KEY, 10),
    );

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
  });

  it('usa valor inicial cuando localStorage tiene JSON invalido', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');

    const { result } = renderHook(() =>
      useLocalStorage(STORAGE_KEY, 'safe'),
    );

    expect(result.current[0]).toBe('safe');
  });

  // FE-15: la escritura ocurre en un efecto (persistencia.md § Mecánica,
  // 2026-09-20); el fallo se expone sin silenciarlo.
  it('no rompe si localStorage falla al escribir y expone el error (FE-15)', () => {
    const { result } = renderHook(() =>
      useLocalStorage(STORAGE_KEY, 0),
    );
    // La escritura inicial sí puede (localStorage disponible).
    expect(result.current[2].ok).toBe(true);

    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    setItem.mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    act(() => {
      result.current[1](99);
    });

    expect(result.current[0]).toBe(99);
    expect(result.current[2]).toEqual({ ok: false });

    setItem.mockRestore();
  });

  it('recupera el estado ok tras una escritura exitosa posterior (FE-15)', () => {
    const { result } = renderHook(() =>
      useLocalStorage(STORAGE_KEY, 0),
    );

    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    setItem.mockImplementationOnce(() => {
      throw new Error('quota exceeded');
    });

    act(() => {
      result.current[1](1);
    });
    expect(result.current[2].ok).toBe(false);

    act(() => {
      result.current[1](2);
    });
    expect(result.current[2].ok).toBe(true);

    setItem.mockRestore();
  });

  // P2 (2026-09-20): la escritura vive en un efecto, nunca dentro del updater;
  // el hook debe ser estable y puro bajo StrictMode.
  it('aplica un solo update funcional bajo React.StrictMode', () => {
    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, 0), {
      wrapper: StrictMode,
    });

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1');
    expect(result.current[2].ok).toBe(true);
  });

  it('escribe una única vez por cambio de valor bajo React.StrictMode', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const llamadas: string[] = [];
    setItem.mockImplementation((key: string, value: string) => {
      if (key === STORAGE_KEY) llamadas.push(value);
    });

    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, 'a'), {
      wrapper: StrictMode,
    });

    const antesDeCambiar = llamadas.filter((v) => v === '"a"').length;
    act(() => {
      result.current[1]('b');
    });
    const trasCambiar = llamadas.filter((v) => v === '"b"').length;

    expect(antesDeCambiar).toBeGreaterThanOrEqual(1); // sincronización inicial
    expect(trasCambiar).toBe(1); // un solo write por cambio, sin duplicados
    setItem.mockRestore();
  });
});
