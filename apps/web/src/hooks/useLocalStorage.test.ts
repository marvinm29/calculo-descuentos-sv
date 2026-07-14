import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'test-key';

describe('useLocalStorage', () => {
  it('retorna el valor inicial cuando no hay dato guardado', () => {
    const { result } = renderHook(() =>
      useLocalStorage(STORAGE_KEY, 'default'),
    );
    expect(result.current[0]).toBe('default');
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

  it('no rompe si localStorage falla al escribir', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    setItem.mockImplementationOnce(() => {
      throw new Error('quota exceeded');
    });

    const { result } = renderHook(() =>
      useLocalStorage(STORAGE_KEY, 0),
    );

    act(() => {
      result.current[1](99);
    });

    expect(result.current[0]).toBe(99);

    setItem.mockRestore();
  });
});
