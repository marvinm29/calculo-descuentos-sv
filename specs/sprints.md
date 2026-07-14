# Plan de Implementación por Sprints

> Documenta el orden de construcción del monorepo desde cero (solo `specs/`
> y configs existen al inicio). Cada sprint deja el proyecto verificable con
> `pnpm lint && pnpm check-types && pnpm test` y debe documentarse al terminar;
> no iniciar el siguiente sin confirmación.

## Supuestos asumidos por defecto

(Si el usuario no responde, se aplican estos.)

- **Backend en cliente**: el frontend **no** llama al API en runtime. Calcula
  en el cliente importando `packages/shared` (ADR-001 / ADR-006 modo offline).
  El API queda como validador de referencia. Solo se consumiría si en el futuro
  se pide explícitamente.
- **Exportación PDF**: se usa `window.print()` + CSS `@media print` (RF10
  permite "alternativa: impresión directa del navegador"). No se añaden
  dependencias (`react-to-print`, `jspdf`) sin autorización, por la regla
  "no nuevas deps sin verificar".
- **Cobertura > 80%**: se configura `coverage.thresholds` en `vitest.config`
  para que CI falle si baja del umbral (alinea con RNF05).

---

## Sprint 1 — Cimientos: monorepo + `packages/config` + `packages/shared` (tipos/Zod/tasas)

**Objetivo**: dejar el monorepo operable con scripts funcionando y las
constantes/tipos/esquemas listos para los demás paquetes.

- `pnpm-workspace.yaml`, `turbo.json`, `package.json` raíz con scripts
  (`lint`, `check-types`, `test`, `dev`, `build`, `format`).
- `packages/config`: `tsconfig/base.json`, `eslint.config.*`, reexporta
  `.prettierrc` raíz.
- `packages/shared/src`:
  - `tasas.ts`: exacto a `specs/tasas-legales.md` §238–287 (fuente única).
  - `types.ts`: `CalcularRequest`, `CalcularResponse`, `SegmentoHorario`,
    unions `TipoJornada`/`Antiguedad`/`TipoPago`.
  - `schemas.ts`: esquemas Zod espejo del contrato API (validación + inferencia).
- Configurar Vitest; smoke test.

**Verificación**: `pnpm install && pnpm lint && pnpm check-types && pnpm test`
pasan; tasas y tipos importables desde `@calc/shared`.

---

## Sprint 2 — Lógica de cálculo en `packages/shared` (RF03, RF04, RF05)

**Objetivo**: toda la matemática legal en funciones puras y testeada.

- `src/calc/horasExtra.ts`: salario/hora, factores, nocturnidad (Art. 168).
- `src/calc/descuentos.ts`: ISSS con tope $30, AFP con tope, Renta por tramos
  (mensual y quincenal — `/2`).
- `src/calc/prestaciones.ts`: aguinaldo (proporcional + tramos por antigüedad),
  vacaciones + bono 30%, Quincena 25 (solo si salario ≤ $1,500).
- `src/calc/calcular.ts`: orquestador que arma `CalcularResponse` desde
  `CalcularRequest`.
- Tests unitarios verificando:
  - Ejemplos de `specs/tasas-legales.md` (salario $800).
  - Response de ejemplo de `specs/api-contract.md` ($800 quincenal, 3–9 años).

**Verificación**: `pnpm test -- --coverage` > 80% sobre `packages/shared`.

---

## Sprint 3 — `apps/api` Express (ADR-005: `POST /api/calcular`)

**Objetivo**: backend stateless que valida y delega a `packages/shared`.

- `apps/api/src`:
  - `app.ts`: CORS, JSON parser, rate limiter (100/min), routes, errorHandler.
  - `routes/calcular/calcular.{routes,controller,service}.ts`.
  - `middleware/errorHandler.ts`: respuestas con `error`/`message`/`details`
    según `api-contract.md`.
- `service` reutiliza `calcular()` de `@calc/shared` (ADR-001: lógica única
  en shared).
- Tests con Supertest: happy path, 400 `VALIDATION_ERROR` con `details`,
  429 `RATE_LIMIT_EXCEEDED`, 500 `INTERNAL_ERROR`.

**Verificación**: servidor levanta en `:3001`; tests cubren el contrato.

---

## Sprint 4 — `apps/web` scaffold + `ConfigInicial` + `useLocalStorage` (RF01, RF09 parcial)

**Objetivo**: shell del frontend funcional con configuración persistente.

- Vite 8 + React 19 + Tailwind v4 (CSS-first) + Recharts.
- `App.tsx` con layout base y `<ErrorBoundary>`.
- `hooks/useLocalStorage.ts` (genérico, SSR-safe).
- `hooks/useCalculos.ts` (esqueleto, se implementa en Sprint 6).
- `components/ConfigInicial.tsx`: salario base, tipoPago, antigüedad,
  fechaIngreso. Validación (salario > 0, fechas ISO) + persistencia.
- Test RTL de validaciones y persistencia tras recarga.

**Verificación**: `pnpm dev` muestra el formulario; recargar restaura la config.

---

## Sprint 5 — `RegistroSemanal` (RF02)

**Objetivo**: captura semanal de horas con persistencia.

- `components/RegistroSemanal.tsx` + subcomponentes:
  - `SelectorSemana.tsx`: navegación entre semanas.
  - `FilaDia.tsx` (×7, Lun–Dom).
  - `SelectorTipoHora.tsx`: dropdown de `TipoJornada`.
  - `TotalesSemana.tsx`: suma semanal en tiempo real.
- Guardado automático por `semanaId` en `localStorage` (Map<semanaId, Dia[]>).
- Test RTL de captura de horas y totales.
- Permite ver semanas anteriores.

**Verificación**: registrar una semana y recargar restaura los datos.

---

## Sprint 6 — Resultados: `ResultadoNeto`, `GraficoPastel`, `TablaTasas` (RF04, RF06, RF07, RF08)

**Objetivo**: desglose completo del cálculo e visualizaciones.

- `hooks/useCalculos.ts`: consume `calcular()` de `@calc/shared` en cliente
  (modo offline puro), memorizado con `useMemo`.
- `components/ResultadoNeto.tsx` con:
  - `ResumenBruto.tsx`, `TablaDescuentos.tsx`, `Prestaciones.tsx`, `NetoLiquido.tsx`.
  - Cada línea indica fórmula o % aplicado.
- `components/GraficoPastel.tsx` (Recharts): distribución neto / ISSS / AFP /
  Renta, colores con contraste AA, leyenda con montos en USD.
- `components/TablaTasas.tsx`: tasas vigentes + enlaces `.gob.sv` + fecha
  última actualización.
- Test RTL con fixture del ejemplo $800 quincenal.

**Verificación**: al ingresar config + horas, se muestra el resumen completo.

---

## Sprint 7 — `HistorialPeriodos` + `ExportarPDF` + afinado final (RF09, RF10)

**Objetivo**: cierre de RF01–RF10 end-to-end.

- `components/HistorialPeriodos.tsx`: lista de periodos guardados, eliminar,
  restaurar. Muestra fecha y neto por periodo.
- `components/ExportarPDF.tsx`: `window.print()` + hoja `@media print` legible.
- Ajustes responsive (breakpoints 320 / 640 / 768 / 1024 / 1280).
- A11y: labels, navegación por teclado, contraste (WCAG 2.1 AA).
- Tests RTL de CRUD historial + snapshot del resumen imprimible.

**Verificación**: `pnpm turbo run build --filter=web` deja `apps/web/dist`
listo para GitHub Pages; `lint + check-types + test` y coverage > 80% en verde.

---

## Estado de ejecución

| Sprint | Estado      | Notas |
|--------|-------------|-------|
| 1      | completado  | Monorepo + config + shared (tipos/Zod/tasas) |
| 2      | pendiente   | —     |
| 3      | pendiente   | —     |
| 4      | pendiente   | —     |
| 5      | pendiente   | —     |
| 6      | pendiente   | —     |
| 7      | pendiente   | —     |

---

## Sprint 1 — Cimientos: monorepo + `packages/config` + `packages/shared`

**Completado**: 2026-07-13.

### Archivos creados

- Raíz: `pnpm-workspace.yaml`, `turbo.json`, `package.json`, `.npmrc`.
- `packages/config/`: `package.json`, `tsconfig/base.json` (strict, ES2023, moduleResolution bundler),
  `eslint.config.js` (flat, type-aware via `typescript-eslint`).
- `packages/shared/`: `package.json`, `tsconfig.json`, `tsconfig.build.json`, `vitest.config.ts`,
  `eslint.config.js` (reexporta el de config), y en `src/`:
  - `tasas.ts` — copia exacta de `specs/tasas-legales.md` §238–287
    (ISSS/AFP/RENTA_TRAMOS_MENSUAL/HORAS_EXTRA/AGUINALDO_DIAS/VACACIONES/QUINCENA_25
    + `DIAS_ASUETO_FIJOS` sin Semana Santa, que es fecha variable).
  - `types.ts` — `CalcularRequest`, `CalcularResponse` y todas sus sub-interfaces,
    `SegmentoHorario`, unions `TipoPago`/`Antiguedad`/`TipoJornada`, `CalculoState`
    (discriminated union).
  - `schemas.ts` — `calcularRequestSchema` (Zod) con `.refine` para fechaIngreso/Inicio/Fin,
    `validarNegocio()` para periodo > 31 días (espejo de `api-contract.md`).
  - `index.ts` — barrel export.
- Tests: `packages/shared/src/__tests__/smoke.test.ts` (14 tests).
- Skills (Fase 0): `.opencode/skills/{sv-legal-calc,react-vite-tailwind4,vitest-rtl-supertest,sprint-workflow}/SKILL.md`.

### Versiones fijadas (decisiones值得documentar)

- **TypeScript 5.9.3** (no 7.0.2 que es latest). Motivo: `typescript-eslint@8.64.0` solo soporta peer
  `typescript >=4.8.4 <6.1.0`. TS 7 rompería el lint. Subir a TS 7 cuando typescript-eslint saque
  versión compatible (track `8.64.1-alpha` o `9.x`).
- Otras: pnpm 9.15.9, turbo 2.10.5, eslint 10.7.0 (flat config), typescript-eslint 8.64.0,
  vitest 4.1.10 + @vitest/coverage-v8, zod 4.4.3, @types/node 26.1.1, prettier 3.9.5.

### Verificación (gate en orden)

```
pnpm lint          → 1 task OK (eslint .)
pnpm check-types   → 1 task OK (tsc --noEmit, strict + noUncheckedIndexedAccess)
pnpm test          → 14/14 tests OK, 1 file
                   → coverage 100% (statements/branches/functions/lines) con thresholds=80 ✓
pnpm --filter=@calc/shared build  → dist/ generado con .js + .d.ts + sourcemaps
```

### Desviaciones del plan

- Tuve que añadir `eslint.config.js` en cada paquete que quiera lint (reexporta el de `@calc/config`)
  porque ESLint 10 no busca upward. Documentado para los próximos sprints.
- `tsconfig.build.json` separado del `tsconfig.json` (el build incluye solo `src/`, el check-types
  incluye también `vitest.config.ts` y usa `noEmit`).
- `DIAS_ASUETO` (que en spec incluía Semana Santa con `mes:1,dia:1` placeholder) se renombró a
  `DIAS_ASUETO_FIJOS` y se excluyó Semana Santa — era incorrecto meter fechas variables como fijas.
  Pendiente: resolver Semana Santa en runtime (Sprint 2 o 5).

### Known issues / siguientes pasos

- Sin apps todavía (apps/web y apps/api se crean en Sprints 3 y 4).
- `packages/shared` no expone aún `calcular()` ni la lógica de cálculo (es Sprint 2).
- Coverage 100% se debe a que `tasas.ts` y `types.ts` no tienen statements ejecutables (solo
  declaraciones); el umbral > 80% es exigente a partir de Sprint 2 cuando se agreguen los
  módulos `calc/*`. En Sprint 2 esos tests son los que establecen la real cobertura.
- `.gitignore` ya ignora `dist`, `coverage`, `node_modules`, `.turbo`, `*.tsbuildinfo`.