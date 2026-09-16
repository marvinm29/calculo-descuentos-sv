# Spec: Persistencia

> Verdad actual congelada. Persistencia **solo en localStorage** (ADR-003 puro).
> Clerk + SQLite + historial de backend **eliminados** el 2026-08-30 (ADR-011).

## localStorage keys (frontend)

| Key | Tipo | Propósito |
|---|---|---|
| `config-inicial` | `ConfigInicialData` | salarioBase, tipoPago, antiguedad, fechaIngreso |
| `jornada-config` | `JornadaConfig` | solo `modalidad` |
| `entradas-periodo` | `EntradaPeriodo[]` | lista de horas extra/día libre/asueto por fecha |
| `incentivos` | `Incentivo[]` | bonos/comisiones con `aplicaDescuentos` |
| `historial-periodos` | `PeriodoGuardado[]` | neto/bruto/fecha de periodos guardados |
| `theme` | `'light' \| 'dark' \| 'system'` | preferencia del hook `useTheme` |

Mecanismo: hook genérico `useLocalStorage<T>(key, initial, parse?)`. Desde 2026-09-15 el
parse es obligatorio para las claves de dominio (`lib/storage.ts`): Zod valida la forma antes
de usarla (Regla 8 de `integridad-calculo.md`). Claves muertas (`registro-periodo`,
`registro-semanal`) se eliminan al cargar la app; si una clave se descarta por corrupción, la
UI muestra un aviso (`clavesDescartadas` en `AppContext`) y se usa el default.

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