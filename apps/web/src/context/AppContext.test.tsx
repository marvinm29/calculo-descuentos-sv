import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAppContext } from '../context/AppContext';

describe('AppContext', () => {
  it('useAppContext fuera de AppProvider lanza error descriptivo', () => {
    expect(() => renderHook(() => useAppContext())).toThrow(
      'useAppContext must be used within an AppProvider',
    );
  });
});
