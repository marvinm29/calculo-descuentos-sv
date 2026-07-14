# Calculadora de Descuentos de Ley - El Salvador

Calculadora web para determinar los descuentos de ley (ISSS, AFP, Renta)
y prestaciones laborales a partir de tu salario y horas extra trabajadas.
Incluye un control semanal de horas por tipo de jornada con persistencia local.

## Características

- Calculo de horas extra: diurnas, nocturnas, dias libres, asuetos
- Descuentos de ley: ISSS (3%), AFP (7.25%), Renta (tabla progresiva)
- Prestaciones: aguinaldo, vacaciones, Quincena 25
- Registro semanal de horas con persistencia en localStorage
- Grafico de distribucion salarial (Recharts)
- Tabla de tasas vigentes con enlaces a fuentes oficiales .gob.sv
- Exportacion a PDF
- Modo offline: calculos funcionan sin conectividad al backend

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
pnpm dev          # Inicia frontend (http://localhost:5173) y backend (http://localhost:3001)
pnpm test         # Ejecuta tests
pnpm lint         # Linting
pnpm check-types  # Type check
```

## Produccion

```bash
pnpm build        # Build de todos los paquetes
```

- Frontend desplegado en GitHub Pages
- Backend desplegado en Render.com

## Estructura

```
apps/
├── web/          # React + Vite frontend
└── api/          # Express + TypeScript backend
packages/
├── shared/       # Tipos y constantes compartidas
└── config/       # ESLint, TypeScript, Prettier configs
specs/            # Documentacion de requerimientos y arquitectura
```

## Fuentes Oficiales

Todas las tasas estan verificadas contra fuentes .gob.sv:
- `mtps.gob.sv` -- Ministerio de Trabajo
- `isss.gob.sv` -- Instituto Salvadoreno del Seguro Social
- `ssf.gob.sv` -- Superintendencia del Sistema Financiero
- `mh.gob.sv` -- Ministerio de Hacienda

Ver `specs/tasas-legales.md` para el detalle completo.

## Disclaimer

Esta calculadora es una herramienta informativa. Los valores exactos dependen
de tu empleador y pueden variar. No constituye asesoria legal o fiscal.
