# Calculadora de Descuentos de Ley - El Salvador

Aplicación web para calcular descuentos de ley (ISSS, AFP, Renta),
prestaciones laborales (aguinaldo, vacaciones, Quincena 25) y
control de horas extra con registro semanal.

> Estado: el repositorio contiene solo `specs/` y config; `apps/` y `packages/`
> aún no existen. `CLAUDE.md` y `.github/copilot-instructions.md` importan este
> archivo, así que mantenlo como fuente única de instrucciones.

## Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React + Vite + TypeScript | React 19, Vite 8 |
| Backend | Express + TypeScript | Express 5, Node 22 |
| Monorepo | Turborepo + pnpm | pnpm 9+ |
| Testing | Vitest + React Testing Library + Supertest | |
| Linting | ESLint + Prettier | |
| Estilos | TailwindCSS | v4 |
| Validación | Zod | |
| Gráficos | Recharts | |

Node 22 y pnpm 9 son obligatorios (CI los fija). No uses otra versión.

## Comandos

```bash
pnpm install                         # Instalar dependencias
pnpm dev                             # Frontend :5173 + backend :3001
pnpm build                           # Build de producción (todos)
pnpm turbo run build --filter=web    # Build solo del frontend (lo que CI deploya)
pnpm test                            # Todos los tests
pnpm test -- --watch                 # Tests en watch
pnpm test -- <patrón>                # Un solo archivo / test
pnpm test -- --coverage              # Con coverage (así lo corre CI)
pnpm lint                            # ESLint
pnpm check-types                     # tsc --noEmit
pnpm format                          # Prettier
```

## Verificación post-cambio

Orden requerido (igual que CI en `.github/workflows/ci.yml`):

```bash
pnpm lint && pnpm check-types && pnpm test
```

CI además hace build solo en `main` con `--filter=web` y sube
`apps/web/dist` a GitHub Pages. El backend se deploya aparte en Render.

## Arquitectura

```
apps/web/            → React SPA (deploy: GitHub Pages)
apps/api/            → Express REST API (deploy: Render.com)
packages/shared/     → Tipos y constantes compartidas (incl. tasas legales)
packages/config/     → ESLint, TypeScript, Prettier configs
specs/               → requirements / architecture / api-contract / tasas-legales
```

- Cálculos corren en el cliente; el backend solo valida (`POST /api/calcular`).
- Persistencia semanal de horas en `localStorage` (no hay DB).
- Ver `specs/architecture.md` y `specs/api-contract.md` antes de tocar endpoints
  o límites entre paquetes.

## Fuente única de tasas legales

- Tasas vigentes: `packages/shared/src/tasas.ts`.
- Documentación de respaldo (con fuentes `.gob.sv`): `specs/tasas-legales.md`.
- **Nunca** modifiques `tasas.ts` sin actualizar `specs/tasas-legales.md`, ni
  añadas tasas hardcodeadas en otro archivo: impórtalas desde `tasas.ts`.

## Convenciones de Código

### TypeScript
- `strict: true`. No `any` -- usa `unknown` + type narrowing.
- Interfaces para APIs, `type` para unions/primitives.
- `import type` para imports solo de tipos.
- Discriminated unions para estados de datos (loading/success/error).
- Valores monetarios en USD, tipo `number`, 2 decimales.

### React
- Componentes funcionales + hooks. Nada de clases.
- Un componente por archivo (excepto subcomponentes privados).
- Props como `interface` exportada.
- Tests co-ubicados: `Componente.test.tsx` junto a `Componente.tsx`.
- PascalCase componentes, camelCase hooks/helpers.

### Express
- Feature-based: `routes/feature/feature.{routes,controller,service}.ts`.
- Validar inputs con Zod en cada endpoint.
- Error-handling middleware centralizado.
- Tipos de respuesta explícitos.

### Estilo (Prettier)
- `printWidth: 90` (no el default 80), `tabWidth: 2`, `semi: true`,
  `singleQuote: true`, `trailingComma: "all"`, `arrowParens: "always"`.
- Nombres en inglés, pero conceptos legales salvadoreños en español:
  `isss`, `afp`, `renta`, `aguinaldo`, `horasExtra`, `salarioBase`.
- Funciones pequeñas (< 40 líneas idealmente).

## Tests

- **Unitarios**: Vitest para lógica pura (cálculos, utilidades).
- **Componentes**: React Testing Library.
- **API**: Supertest para endpoints Express.
- Coverage > 80% por feature.
- Nombra los tests describiendo comportamiento (sirven como documentación).

## Git Workflow

- Ramas: `feature/nombre-corto` desde `main`.
- Commits: convencionales `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- PRs requieren que CI pase: `lint + check-types + test`.
- No push directo a `main`.

## Restricciones

- No añadir dependencias sin verificar si ya existen.
- No crear archivos fuera de la estructura establecida (`apps/`, `packages/`).
- No usar clases para componentes React.
- No mezclar inglés/español en nombres (salvo conceptos legales listados arriba).

## Skills (`.opencode/skills/`)

Skills en formato estándar Agent Skills (funciona en opencode, Claude Code,
Codex, Gemini CLI, etc.). El agente las carga on-demand según el contexto.

- `sv-legal-calc` -- fórmulas legales SV, invariant `tasas.ts`, fixtures.
- `react-vite-tailwind4` -- convenciones React 19 / Vite 8 / Tailwind v4.
- `vitest-rtl-supertest` -- patrones de testing + coverage > 80%.
- `sprint-workflow` -- cadencia de 7 sprints, gate y documentación.

## Recursos

- `specs/requirements.md` -- Requerimientos funcionales (SWEBOK Ch1).
- `specs/architecture.md` -- Decisiones de arquitectura (SWEBOK Ch2).
- `specs/api-contract.md` -- Contrato de API REST.
- `specs/tasas-legales.md` -- Tasas vigentes con fuentes oficiales `.gob.sv`.
- `specs/sprints.md` -- Plan de implementación por sprints (7).
- `.github/copilot-instructions.md` -- Reglas adicionales (depuis de este archivo).