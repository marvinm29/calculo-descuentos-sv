# Arquitectura - Calculadora de Descuentos SV

> **Nota (2026-08-30)**: los ADRs viven en `.agents/adr/` (formato de la skill `domain-modeling`).
> Este archivo describe la arquitectura **actual** (post Sprint 10b + rediseño 2026-08-30);
> specs desactualizadas: `redisenio-jornada-incentivos.md` (modelo 10a, superado), `api-contract.md`
> (números corregidos). La **verdad actual congelada** está en `openspec/specs/`.

## Diagrama de Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│                    Cliente (Navegador)                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │              React 19 SPA (Vite 8)                  │  │
│  │  ┌────────────┐ ┌────────────┐ ┌───────────────┐   │  │
│  │  │ ConfigInicial│ │ Captura      │ │ Resultados   │   │  │
│  │  │ Jornada/     │ │ Entradas     │ │ + Gráficos   │   │  │
│  │  │ Entradas/    │ │ (período)    │ │ + PDF        │   │  │
│  │  │ Incentivos   │ │              │ │ + Historial  │   │  │
│  │  └──────────────┘ └──────────────┘ └───────────────┘   │  │
│  │         │              │               │               │  │
│  │         ▼              ▼               ▼               │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │  @calc/shared → useCalculos → calcular()       │   │  │
│  │  │  (offline-first, ADR-001/006)                  │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │        localStorage (persistencia, ADR-003)     │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

- **El frontend NO llama al API en runtime.** Calcula en cliente (modo offline puro).
- El API existe como **validador de referencia** (ADR-005/006).

## Decisiones de Arquitectura (ADR)

Los ADRs actuales viven en [`.agents/adr/`](../.agents/adr/):

| ADR | Decisión |
|-----|----------|
| 001 | Lógica de cálculo única en `@calc/shared` (no duplicada) |
| 003 | Persistencia solo localStorage; sin BD |
| 006 | Offline-first: frontend calcula, API solo valida |
| 010 | Captura de horas día por día (`EntradaPeriodo[]`), 10b gana a 10a |
| 011 | Sin autenticación (Clerk eliminado) — utilidad pública |
| 002 | Monorepo pnpm + Turborepo (ver `specs/architecture.md` histórico) |
| 004 | TailwindCSS v4 CSS-first |
| 005 | API única `POST /api/calcular` |

## Diagrama de Componentes Frontend

```
App.tsx
├── ConfigInicial.tsx           ← salario base, tipoPago, antigüedad, fechaIngreso
├── JornadaSelector.tsx         ← modalidad diurna/nocturna (+ tipo/horas residuales, a simplificar)
├── EntradasPeriodo.tsx         ← lista plana: fecha + tipo + horas diurnas/nocturnas (10b)
├── IncentivosForm.tsx          ← concepto + monto + checkbox "aplica descuentos"
├── ResultadoNeto.tsx
│   ├── ResumenBruto.tsx        ← desglose + recargo nocturnidad + incentivos
│   ├── TablaDescuentos.tsx     ← ISSS, AFP, Renta detallados
│   ├── Prestaciones.tsx        ← aguinaldo, vacaciones, Q25 (informativas)
│   └── NetoLiquido.tsx         ← total neto destacado
├── GraficoPastel.tsx           ← distribución salarial (Recharts)
├── TablaTasas.tsx              ← tasas vigentes + links .gob.sv
├── HistorialPeriodos.tsx       ← periodos guardados (localStorage)
└── ExportarPDF.tsx             ← window.print()
```

Hooks: `useCalculos` (deriva `CalcularRequest` → `calcular()`), `useLocalStorage<T>`,
`useTheme` (light/dark/system). Estado global vía `AppContext`.

## Diagrama de Componentes Backend

```
index.ts → app.ts
├── CORS + JSON parser + rate limit (100/min)
├── POST /api/calcular          ← único endpoint (ADR-005)
│   ├── Zod validation + validarNegocio
│   └── service → calcular() de @calc/shared
└── middleware/errorHandler.ts
```

- Sin BD, sin auth, sin historial server (post-rediseño).
- Deploy: DigitalOcean `api.marvinmelendez.engineer` (PM2 + Caddy).

## Estrategia de Estado en Frontend

- **Config**: un solo objeto, persiste en localStorage (`config-inicial`).
- **Jornada**: `JornadaConfig` — solo `modalidad` alimenta el motor.
- **Entradas**: `EntradaPeriodo[]` — lista plana por fecha, sin semanas.
- **Incentivos**: `Incentivo[]` — cada ítem con `aplicaDescuentos`.
- **Cálculos**: derivados de config + jornada + entradas + incentivos, memorizados con `useMemo`.
- **Historial**: guarda el `CalcularRequest` real + response en localStorage.

## Estado de producción

| Servicio | URL | Estado |
|----------|-----|--------|
| Web (GitHub Pages) | `https://marvinmelendez.engineer` | Live |
| API (DigitalOcean) | `https://api.marvinmelendez.engineer` | Live |