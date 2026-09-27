import { useEffect, useState } from 'react';

// FE-15 (persistencia.md § Estado de persistencia): los fallos de escritura
// (cuota agotada, modo privado, acceso denegado) NO se silencian. El hook
// expone el estado y el provider lo superficie como aviso accionable en la UI.
// El estado en memoria se actualiza aunque el guardado falle.
//
// Mecánica (persistencia.md § Mecánica de useLocalStorage, 2026-09-20): la
// escritura en localStorage y el cambio del estado de persistencia ocurren en
// un efecto que observa el valor, NUNCA dentro del updater de estado: los
// updaters deben ser puros porque React puede invocarlos dos veces
// (StrictMode) o descartarlos en renders concurrentes. `setValue` delega en
// `setStoredValue`, que es estable por definición.
export interface EstadoPersistencia {
  /** false cuando la última escritura de la clave falló. */
  ok: boolean;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  parse?: (raw: string) => T,
): [T, (value: T | ((prev: T) => T)) => void, EstadoPersistencia] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        if (parse) return parse(item);
        return JSON.parse(item) as T;
      }
      return initialValue instanceof Function ? initialValue() : initialValue;
    } catch {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  });

  const [persistencia, setPersistencia] = useState<EstadoPersistencia>({
    ok: true,
  });

  // Sincroniza el valor con localStorage. La primera carga escribe el valor
  // inicial (normalmente idéntico al leído); en un entorno sin escritura el
  // aviso aparece desde el arranque, lo cual es correcto: los datos no
  // persistirán (persistencia.md, 2026-09-20).
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
      setPersistencia({ ok: true });
    } catch {
      setPersistencia({ ok: false });
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue, persistencia];
}
