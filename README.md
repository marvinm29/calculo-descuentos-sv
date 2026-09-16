# Calculadora de Descuentos de Ley - El Salvador

Calculadora web para determinar los descuentos de ley (ISSS, AFP, Renta)
y prestaciones laborales a partir de tu salario y horas extra trabajadas.
Incluye captura de horas por fecha (extras, días libres y asuetos) con persistencia local.

## Caracteristicas

- Calculo de horas extra: diurnas (2.00x), nocturnas (2.25x), dias libres (1.50x/1.75x), asuetos (2.00x)
- Descuentos de ley: ISSS (3%), AFP (7.25%), Renta (tabla progresiva)
- Prestaciones: aguinaldo, vacaciones, Quincena 25
- Captura de horas por fecha con persistencia validada en localStorage
- Validaciones de integridad: fechas de calendario reales, máximo 31 días inclusivos por período, máximo 24 h acumuladas por día
- Grafico de distribucion salarial (Recharts)
- Tabla de tasas vigentes con enlaces a fuentes oficiales .gob.sv
- Exportacion a PDF
- Modo offline: calculos funcionan sin conectividad al backend

## Arquitectura

- **Frontend** (`apps/web`): React 19 + Vite 8, calcula todo localmente con `@calc/shared`. Historial 100% en localStorage — sin cuentas.
- **Backend** (`apps/api`): Express 5, público y stateless, con un solo endpoint (`POST /api/calcular`) que actúa como validador de referencia. CORS configurado únicamente en Express (`CORS_ORIGIN`); detrás de Caddy usa `TRUST_PROXY=1` para contabilizar el rate limit por IP real.
- **Shared** (`packages/shared`): tipos, schemas Zod y lógica de cálculo — única fuente de tasas (`tasas.ts`).

## Requisitos

- Node.js >= 22
- pnpm >= 9

## Instalacion

```bash
git clone <repo-url>
cd calculoDescuentos
pnpm install
```

## Desarrollo

```bash
pnpm dev            # Inicia frontend (:5173) y backend (:3001)
pnpm test           # Ejecuta tests
pnpm coverage       # Tests + cobertura (thresholds 80% por paquete)
pnpm lint           # Linting
pnpm check-types    # Type check
pnpm check          # Gate completo: install congelado, build, lint, tipos, cobertura
```

## Produccion

```bash
pnpm build        # Build de todos los paquetes
```

- **Frontend**: GitHub Pages — [marvinmelendez.engineer](https://marvinmelendez.engineer)
- **Backend API**: DigitalOcean — [api.marvinmelendez.engineer](https://api.marvinmelendez.engineer)

## Estructura

```
apps/
  web/            # React + Vite frontend
  api/            # Express + TypeScript backend (público, stateless)
packages/
  shared/         # Tipos, schemas Zod, constantes y logica de calculo
  config/         # ESLint, TypeScript, Prettier configs
specs/            # Documentacion de requerimientos y arquitectura
openspec/         # Specs ejecutables (contrato API, integridad, captura, diseño)
docs/             # Scripts de despliegue y documentacion historica de sesiones
```

## Fuentes Oficiales

Todas las tasas estan verificadas contra fuentes .gob.sv:

- [mtps.gob.sv](https://mtps.gob.sv) — Ministerio de Trabajo
- [isss.gob.sv](https://isss.gob.sv) — Instituto Salvadoreno del Seguro Social
- [ssf.gob.sv](https://ssf.gob.sv) — Superintendencia del Sistema Financiero
- [mh.gob.sv](https://mh.gob.sv) — Ministerio de Hacienda

Ver `specs/tasas-legales.md` para el detalle completo.

## Disclaimer

Esta calculadora es una herramienta informativa. Los valores exactos dependen
de tu empleador y pueden variar. No constituye asesoria legal o fiscal.
