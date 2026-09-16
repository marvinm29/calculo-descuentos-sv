import type { ZodType, output } from 'zod';

// Claves del modelo muerto (Sprint 10a) y del historial remoto retirado
// (ver ADR-011 en specs/architecture.md).
export const CLAVES_MUERTAS = ['registro-periodo', 'registro-semanal'] as const;

// Registro global de claves descartadas por corrupción — el provider la drena
// durante el primer render para mostrar el aviso de UI (Regla 8.3).
const clavesDescartadas = new Set<string>();

export function registrarClavesDescartadas(key: string): void {
  clavesDescartadas.add(key);
}

export function tomarClavesDescartadas(): string[] {
  const claves = [...clavesDescartadas];
  clavesDescartadas.clear();
  return claves;
}

// Migración de limpieza: elimina claves del modelo semanal viejo (10a) y
// cualquier residuo del historial remoto retirado.
export function limpiarClavesMuertas(): void {
  for (const key of CLAVES_MUERTAS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // localStorage no disponible — nada que limpiar
    }
  }
}

/**
 * Devuelve un parser para useLocalStorage: valida el JSON contra `schema`;
 * si falla, elimina la clave, registra el descarte y devuelve el fallback.
 */
export function parseador<T extends ZodType>(
  schema: T,
  fallback: output<T>,
  key: string,
  onDescarte?: (key: string) => void,
): (raw: string) => output<T> {
  return (raw: string): output<T> => {
    try {
      return schema.parse(JSON.parse(raw));
    } catch {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignorar
      }
      if (onDescarte) onDescarte(key);
      else registrarClavesDescartadas(key);
      return fallback;
    }
  };
}
