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

Mecanismo: hook genérico `useLocalStorage<T>()` (SSR-safe, tolerante a JSON corrupto).

## Backend

- **Sin persistencia**: el API es stateless (solo `POST /api/calcular`, ADR-005).
- Historial autenticado (Clerk + SQLite, `routes/history/`, `db.ts`) **eliminado** el 2026-08-30.

## Reglas

- Los datos **no se envían a ningún servidor externo** (RF09).
- Migración de localStorage viejo (`registro-semanal` → `entradas-periodo`): best-effort, ya resuelta en 10b.
- Datos corruptos → defaults; nunca inventar.

## ADRs relacionados

- `ADR-003` (persistencia solo localStorage, sin BD)
- `ADR-011` (sin autenticación — utilidad pública)