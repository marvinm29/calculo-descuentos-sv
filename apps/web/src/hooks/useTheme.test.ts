import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
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
});
