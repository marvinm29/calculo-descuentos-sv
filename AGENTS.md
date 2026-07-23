# Calculadora de Descuentos de Ley — El Salvador

Monorepo (pnpm + Turborepo) — 4 packages: `@calc/web` (React 19 + Vite 8), `@calc/api` (Express 5), `@calc/shared` (tipos/lógica), `@calc/config` (ESLint/TS/Prettier).

Node 22, pnpm 9 obligatorios.

## Comandos

```bash
pnpm dev              # web :5173 + api :3001
pnpm build            # todos los paquetes
pnpm turbo run build --filter=@calc/web   # solo frontend (CI deploya esto)
pnpm test             # todos los tests
pnpm test -- --coverage                   # con coverage (thresholds 80%)
pnpm lint && pnpm check-types && pnpm test  # gate CI (orden exacto)
```

Cada paquete tiene sus propios scripts: `pnpm --filter=<paquete> test`.

## Quirks

- **Imports con `.js`**: `verbatimModuleSyntax: true` obliga a usar `.js` en imports de valor. `import type` no necesita `.js`. Los barrel exports (`packages/shared/src/index.ts`) usan `.js`.
- **TS 5.9.3**: `typescript-eslint@8.64.0` no soporta TS 7. No subir sin verificar compatibilidad.
- **eslint.config.js por paquete**: ESLint 10 flat config no busca upward. Cada paquete (`apps/*`, `packages/*`) necesita su propio `eslint.config.js`.
- **Tailwind v4**: CSS-first (`@import 'tailwindcss'` en `index.css`), sin `tailwind.config.js`. Config vía `@theme` en CSS. Plugin `@tailwindcss/vite`.
- **ErrorBoundary**: única clase (excepción a "functional components"). El resto son componentes funcionales + hooks.
- **Auth**: Clerk (`@clerk/react` en frontend, `@clerk/express` en backend). Usar `getAuth(req)` para obtener `userId`. `clerkMiddleware()` va scoped a `/api/history`.
- **BD**: SQLite vía `better-sqlite3` en `apps/api/data/calculos.db`. `:memory:` para tests. Singleton en `apps/api/src/db.ts`. Directorio se crea automáticamente.
- **Historial**: endpoints `GET/POST/DELETE /api/history` autenticados. Servicio en `routes/history/`. Frontend sincroniza con server cuando logueado, cae a localStorage si no.
- **Sin BD relacional** (salvo SQLite para historial): persistencia principal sigue siendo `localStorage` — hook genérico `useLocalStorage<T>()`.
- **Estado global**: `AppContext` (provider en `App.tsx`). Sin Redux/zustand.

## Arquitectura

```
apps/web/src/            → React SPA (deploy: GitHub Pages — marvinmelendez.engineer)
apps/api/src/            → Express REST API (deploy: DigitalOcean — api.marvinmelendez.engineer)
packages/shared/src/     → tipos, Zod schemas, tasas legales, lógica de cálculo
packages/config/         → ESLint flat config, tsconfig/base.json
```

- Cálculos corren duplicados: frontend (`@calc/shared` importado directo, offline) y backend (`POST /api/calcular`, validación).
- Backend: Express 5, Zod validation, rate limit 100/min, un solo endpoint.
- Frontend: `tsc -b && vite build` (TS compile + Vite bundle).

## Fuente única de tasas

- **`packages/shared/src/tasas.ts`** — única ubicación.
- **`specs/tasas-legales.md`** — documentación con fuentes `.gob.sv`. Actualizar ambos en el mismo cambio.
- No hardcodear tasas en otro archivo — importar desde `tasa`s.

## Convenciones

- `strict: true`, `noUncheckedIndexedAccess: true`. No `any` — usar `unknown` + narrowing.
- Interfaces para APIs, `type` para unions. `import type` para imports solo de tipos.
- `printWidth: 90`, `singleQuote`, `trailingComma: "all"`, `arrowParens: "always"`.
- Nombres en inglés; conceptos legales SV en español: `isss`, `afp`, `renta`, `aguinaldo`, `horasExtra`, `salarioBase`.
- Tests co-ubicados (`Componente.test.tsx` junto a `Componente.tsx`). Naming descriptivo (documentación).
- Feature-based backend: `routes/feature/feature.{routes,controller,service}.ts`.
- Valores monetarios: `number`, 2 decimales, `round2()` helper.

## Skills (.opencode/skills/)

- `sv-legal-calc` — fórmulas legales SV, invariantes de `tasas.ts`, fixtures.
- `react-vite-tailwind4` — convenciones React 19 / Vite 8 / Tailwind v4.
- `frontend-design` — UI/UX polish, theming, diseño visual.
- `vitest-rtl-supertest` — patrones de testing, coverage > 80%.
- `sprint-workflow` — cadencia de 7 sprints, gate y documentación.

## 🎯 Objetivo actual (completado — esperando el próximo)

**Sprint 10 completado** — Rediseño: jornada, horas extra, incentivos (mata bugs #1–#6).

Ver `specs/sprints.md` §Sprint 10 para detalle.

## 🚀 Sprint 10 completado (2026-07-22)

- ✅ `RECARGO_NOCTURNIDAD: 0.25` como constante separada (ya no es multiplicador 1.25)
- ✅ `JORNADA` con límites legales (44h/39h semanales, 8h/7h diarias)
- ✅ Nuevos tipos: `JornadaConfig`, `SemanaRegistro`, `Incentivo`, `ModalidadJornada`
- ✅ `calcular.ts` orquesta recargo nocturnidad + incentivos gravados/no gravados
- ✅ Auto-conversión: exceso sobre 44h/39h se paga como extra
- ✅ Frontend rediseñado: `JornadaSelector`, `SemanaExtrasCard`, `IncentivosForm`, `TotalesPeriodo`
- ✅ Bug #1 fix: `HistorialPeriodos` guarda request real, no hardcodeado
- ✅ Bug #6 fix: `useCalculos` consume modelo nuevo directo (sin semana arbitraria)
- ✅ Migración best-effort de localStorage viejo (`migrarRegistro.ts`)
- ✅ Fix distribucion exceso: cada semana recibe su exceso completo (no secuencial)
- ✅ Fix `minutosDelBloque`: maneja cruce de medianoche (19:00→02:00 = 7h)
- ✅ Migracion rescata `horasBaseNocturnas` de bloques `base` en jornada nocturna
- ✅ 7 tests de `autoConvertirExceso` (48h, 42h, 44h, multi-semana)
- ✅ 8 tests unitarios de `minutosDelBloque` (cruce medianoche, normal, bordes)
- ✅ Gate: `pnpm lint && pnpm check-types && pnpm test` — 204 tests, 0 failures

## Estado de producción

| Servicio | URL | Estado |
|----------|-----|--------|
| API (DO droplet) | `https://api.marvinmelendez.engineer` | ✅ Live (PM2 + Caddy) |
| Web (GitHub Pages) | `https://marvinmelendez.engineer` | ✅ Live (CI pasa, deploy automático) |

## Quirks adicionales

- **Dark mode**: Tailwind v4 class-based. Usar `@custom-variant dark (&:where(.dark, .dark *))` en CSS. El hook `useTheme()` persiste preferencia en localStorage. Toggle button en header con icono sol/luna.
- **Colores frontend**: Definir paleta en `@theme` dentro de `index.css` usando `--color-*` custom properties. Aplicar `dark:` variants en todos los componentes.
- **Caracteres españoles**: Usar UTF-8 plano (á, é, í, ó, ú, ñ, ü) directamente en JSX. React escapa automáticamente. No usar HTML entities (`&oacute;`, `&ntilde;`, etc.).
- **Jornada**: `JornadaSelector` (modalidad diurna/nocturna, tiempo completo/personalizado). Horas extras como buckets semanales sin fechas (`SemanaExtrasCard`). Exceso legal → auto-conversión a extra.
- **Incentivos**: `IncentivosForm` con checkbox "Aplica descuentos de ley" default true. Los no gravados se suman al bruto total sin cotizar.
- **Historico viejo**: localStorage key `registro-semanal` (formato `DiaRegistro[]` con bloques horarios) fue reemplazada por `jornada-config` + `registro-periodo` + `incentivos`. Migración best-effort en `migrarRegistro.ts` — datos corruptos → defaults, no inventar.

## Recursos clave

- `specs/architecture.md` — ADRs, diagramas de componentes.
- `specs/api-contract.md` — contrato REST (request/response/errores).
- `specs/requirements.md` — RF01–RF10 con criterios de aceptación.
- `specs/sprints.md` — plan de implementación y estado de ejecución.
