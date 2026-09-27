# Spec: Persistencia

> Verdad actual congelada. Persistencia **solo en localStorage** (ADR-003 puro).
> Clerk + SQLite + historial de backend **eliminados** el 2026-08-30 (ADR-011).

## localStorage keys (frontend)

| Key | Tipo | Propósito |
|---|---|---|
| `config-inicial` | `ConfigInicialData` | salarioBase, tipoPago, antiguedad, fechaIngreso |
| `entradas-periodo` | `EntradaPeriodo[]` | lista de horas extra/día libre/asueto por fecha |
| `incentivos` | `Incentivo[]` | bonos/comisiones con `aplicaDescuentos` |
| `historial-periodos` | `PeriodoGuardado[]` | neto/bruto/fecha de periodos guardados |
| `theme` | `'light' \| 'dark' \| 'system'` | preferencia del hook `useTheme` |

Mecanismo: hook genérico `useLocalStorage<T>(key, initial, parse?)`. Desde 2026-09-15 el
parse es obligatorio para las claves de dominio (`lib/storage.ts`): Zod valida la forma antes
de usarla (Regla 8 de `integridad-calculo.md`). Claves muertas (`registro-periodo`,
`registro-semanal`, `jornada-config`) se eliminan al cargar la app; si una clave se descarta por
corrupción, la UI muestra un aviso (`clavesDescartadas` en `AppContext`) y se usa el default.

## `historial-periodos` (FE-02, FE-16)

- Se lee y escribe exclusivamente mediante un schema Zod compartido (`historialPeriodosSchema`
  en `@calc/shared`) y un parser `parseador(...)`; nunca por cast `JSON.parse(...) as T`.
  Un valor con forma parcial (p. ej. `neto: "abc"` o `NaN` serializado) se descarta, la clave se
  elimina y la app arranca con historial vacío + aviso, sin romper el árbol de componentes.
- `fecha` es una marca de guardado en formato **timestamp ISO 8601 UTC** (lo que produce
  `new Date(...).toISOString()`, p. ej. `2026-09-20T18:30:00.000Z`). El schema exige un
  timestamp válido y canónico: un string arbitrario, una fecha imposible (`2026-13-01T...`) o
  un offset no UTC se rechazan como corrupción y descartan la entrada. La UI lo muestra vía
  `new Date(fecha).toLocaleDateString('es-SV')`; este es el único uso permitido de UTC
  (registro técnico de guardado, no fecha de negocio — FE-14 no aplica a esta marca).
- Retención: máximo **50 periodos guardados**; al excederlo se recorta el más antiguo (FIFO)
  para no agotar la cuota de localStorage.

## Mecánica de `useLocalStorage` (FE-15, 2026-09-20)

- La escritura en `localStorage` y el cambio del estado de persistencia ocurren en un **efecto**
  (`useEffect`) que observa el valor, nunca dentro de un *state updater*: los updaters deben ser
  puros porque React puede invocarlos dos veces (StrictMode) o descartar renders concurrentes.
- La primera carga escribe el valor inicial (normalmente idéntico al leído); en un entorno sin
  escritura (modo privado) el aviso aparece desde el arranque, lo cual es correcto: los datos no
  persistirán. Pruebas del hook se ejecutan envueltas en `React.StrictMode`.

## Estado de persistencia (FE-15)

`useLocalStorage` no puede silenciar fallos de escritura (cuota agotada, modo privado, acceso
denegado): expone el estado de persistencia y el provider lo superficie a la UI. El aviso es
no bloqueante, accionable (indica que los cambios se perderán al cerrar la página) y no
revela datos salariales. Actualizar el estado en memoria continúa aunque el guardado falle.

## Backend

- **Sin persistencia**: el API es stateless (solo `POST /api/calcular`, ADR-005).
- Historial autenticado (Clerk + SQLite, `routes/history/`, `db.ts`) **eliminado** el 2026-08-30.

## Reglas

- Los datos **no se envían a ningún servidor externo** (RF09).
- Migración de limpieza: claves del modelo semanal viejo (`registro-periodo`, `registro-semanal`) se eliminan explícitamente al cargar.
- Datos corruptos → clave eliminada + default + aviso de UI; nunca inventar ni propagar `NaN`.

## ADRs relacionados

- `ADR-003` (persistencia solo localStorage, sin BD)
- `ADR-011` (sin autenticación — utilidad pública)