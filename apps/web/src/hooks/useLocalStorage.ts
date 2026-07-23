import { useState, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) return JSON.parse(item) as T;
      return initialValue instanceof Function ? initialValue() : initialValue;
    } catch {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue =
          value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        } catch {
          // Quota exceeded or access denied — silently ignore
        }
        return nextValue;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
