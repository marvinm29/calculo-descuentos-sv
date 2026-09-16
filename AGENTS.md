# Calculadora de Descuentos de Ley — El Salvador

Monorepo (pnpm + Turborepo) — 4 packages: `@calc/web` (React 19 + Vite 8), `@calc/api` (Express 5), `@calc/shared` (tipos/Zod/lógica), `@calc/config` (ESLint/TS/Prettier).

Node 22, pnpm 9 obligatorios.

**Arquitectura vigente**: API pública y stateless (un solo endpoint `POST /api/calcular`), **sin Clerk, sin SQLite y sin historial remoto** (ADR-011). Historial 100% en localStorage. Las notas de sesión en `docs/sesion-*.md` que mencionan Clerk/SQLite/history son histórico — no usar como guía.

## Comandos

```bash
pnpm dev              # web :5173 + api :3001
pnpm build            # todos los paquetes
pnpm turbo run build --filter=@calc/web   # solo frontend (CI deploya esto)
pnpm test             # todos los tests
pnpm coverage         # tests + cobertura por paquete (thresholds 80%, sin caché)
pnpm lint && pnpm check-types && pnpm test  # gate CI (orden exacto)
pnpm check            # gate completo: install congelado + build + lint + tipos + cobertura
```

Cada paquete tiene sus propios scripts: `pnpm --filter=<paquete> test` y `test:coverage`.

## Quirks

- **Imports con `.js`**: `verbatimModuleSyntax: true` obliga a usar `.js` en imports de valor. `import type` no necesita `.js`. Los barrel exports (`packages/shared/src/index.ts`) usan `.js`.
- **TS 5.9.3**: `typescript-eslint@8.64.0` no soporta TS 7. No subir sin verificar compatibilidad.
- **eslint.config.js por paquete**: ESLint 10 flat config no busca upward. Cada paquete (`apps/*`, `packages/*`) necesita su propio `eslint.config.js`.
- **Tailwind v4**: CSS-first (`@import 'tailwindcss'` en `index.css`), sin `tailwind.config.js`. Config vía `@theme` en CSS. Plugin `@tailwindcss/vite`.
- **ErrorBoundary**: única clase (excepción a "functional components"). El resto son componentes funcionales + hooks.
- **Sin BD**: el API es stateless; persistencia principal es `localStorage` vía `useLocalStorage<T>(key, initial, parse?)`. El tercer parámetro `parse` es obligatorio para claves de dominio: valida con Zod (`apps/web/src/lib/storage.ts`); datos corruptos → clave eliminada + default + aviso (`clavesDescartadas` en `AppContext`). Claves muertas (`registro-periodo`, `registro-semanal`) se eliminan al cargar.
- **Estado global**: `AppContext` (provider en `App.tsx`). Sin Redux/zustand.
- **Contrato estricto** (`openspec/specs/integridad-calculo.md` — reglas 1–10): fechas de calendario reales, segmentos dentro del período, ≤ 24 h acumuladas por fecha, ≤ 31 días inclusivos, ≤ 100 segmentos / 50 incentivos, números finitos, campos desconocidos rechazados (`z.strictObject`). La UI aplica las mismas reglas que el API.
- **Sin recargo nocturno inferido**: `horasBaseNocturnas` y `recargoNocturnidad` eliminados (2026-09-15). Los factores 2.25×/1.75× de horas extra/día libre nocturnas permanecen. Reintroducir requiere captura explícita + nueva spec.
- **CORS/proxy**: CORS sólo en Express (`CORS_ORIGIN`, lista por comas). `TRUST_PROXY=1` en producción (Caddy→Express) para rate limit por IP real. Caddy no añade headers CORS. Express escucha en `127.0.0.1` por defecto (`HOST` env).

## Arquitectura

```
apps/web/src/            → React SPA (deploy: GitHub Pages — marvinmelendez.engineer)
apps/api/src/            → Express REST API, público y stateless (deploy: DigitalOcean — api.marvinmelendez.engineer)
packages/shared/src/     → tipos, Zod schemas, tasas legales, lógica de cálculo
packages/config/         → ESLint flat config, tsconfig/base.json
```

- Cálculos corren duplicados: frontend (`@calc/shared` importado directo, offline) y backend (`POST /api/calcular`, validación).
- Backend: Express 5, Zod strict validation, rate limit 100/min por IP real, un solo endpoint. Factory `createApp()` en `app.ts` para configurar CORS/trust proxy/rate limit/Sentry en tests.
- Frontend: `tsc -b && vite build` (TS compile + Vite bundle).

## Fuente única de tasas

- **`packages/shared/src/tasas.ts`** — única ubicación.
- **`specs/tasas-legales.md`** — documentación con fuentes `.gob.sv`. Actualizar ambos en el mismo cambio.
- No hardcodear tasas en otro archivo — importar desde `tasas`.

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

## Estado de producción

| Servicio | URL | Estado |
|----------|-----|--------|
| API (DO droplet) | `https://api.marvinmelendez.engineer` | ✅ Live (PM2 usuario de servicio + Caddy; `.env` en `/etc/calculo-descuentos/api.env`) |
| Web (GitHub Pages) | `https://marvinmelendez.engineer` | ✅ Live (CI pasa, deploy automático) |

Despliegue/endurecimiento del droplet: `docs/setup-droplet.sh` (despliegue versionado con rollback, sin `git reset --hard`).

## Quirks adicionales

- **Dark mode**: Tailwind v4 class-based. Usar `@custom-variant dark (&:where(.dark, .dark *))` en CSS. El hook `useTheme()` persiste preferencia en localStorage (`theme-preference`). Toggle button en header con icono sol/luna.
- **Colores frontend**: Definir paleta en `@theme` dentro de `index.css` usando `--color-*` custom properties. Aplicar `dark:` variants en todos los componentes.
- **Caracteres españoles**: Usar UTF-8 plano (á, é, í, ó, ú, ñ, ü) directamente en JSX. React escapa automáticamente. No usar HTML entities (`&oacute;`, `&ntilde;`, etc.).
- **Jornada**: `JornadaSelector` solo informativo (modalidad diurna/nocturna). No hay auto-conversión de exceso; las horas se ingresan explícitamente como entradas por fecha.
- **Incentivos**: `IncentivosForm` con checkbox "Aplica descuentos de ley" default true. Los no gravados se suman al bruto total sin cotizar. Filas vacías (sin concepto y sin monto) no se envían al cálculo.

## Recursos clave

- `openspec/specs/integridad-calculo.md` — reglas de integridad rectoras (2026-09-15).
- `openspec/specs/contrato-calcular.md` + `specs/api-contract.md` — contrato REST sincronizado.
- `specs/architecture.md` — ADRs, diagramas de componentes (ADR-011: sin autenticación).
- `specs/requirements.md` — RF01–RF10 con criterios de aceptación.
- `CHANGELOG.md` — decisiones y cambios con fecha.
