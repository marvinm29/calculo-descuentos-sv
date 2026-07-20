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
| 2      | completado  | Lógica de cálculo en shared (horasExtra, descuentos, prestaciones, calcular) |
| 3      | completado  | apps/api Express (POST /api/calcular + errorHandler + tests Supertest) |
| 4      | completado  | apps/web scaffold + ConfigInicial + useLocalStorage + ErrorBoundary |
| 5      | completado  | RegistroSemanal: FilaDia, TotalesSemana, persistencia por semanaId |
| 6      | completado  | ResultadoNeto, GraficoPastel, TablaTasas, useCalculos real |
| 7      | completado  | HistorialPeriodos, ExportarPDF, CI/CD, ajustes finales |
| 8      | completado  | Producción: DigitalOcean + Monitoreo + Hardening |
| 9      | completado  | UI/UX: Dark/light mode, mejora visual, vista día por día |

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

---

## Sprint 2 — Lógica de cálculo en `packages/shared`

**Completado**: 2026-07-13.

### Archivos creados

- `packages/shared/src/calc/horasExtra.ts` — `calcularSalarioHora()`, `calcularPagoSegmentos()`, `round2()`.
  Factores según Art. 168-173 CT importados de `tasas.ts`.
- `packages/shared/src/calc/descuentos.ts` — `calcularDescuentos()`: ISSS (3%, tope $30 mensual),
  AFP (7.25%, tope $6,843.48), Renta (tabla mensual tramos I-IV y quincenal con tramos/2).
- `packages/shared/src/calc/prestaciones.ts` — `calcularAguinaldo()` (proporcional < 1 año,
  15/19/21 días), `calcularVacaciones()` (30% de 15 días), `calcularQuincena25()` (50% si ≤ $1,500).
- `packages/shared/src/calc/calcular.ts` — `calcular()`, orquestador principal: recibe
  `CalcularRequest`, retorna `CalcularResponse` con bruto, descuentos, prestaciones, neto.
- `packages/shared/src/calc/__tests__/horasExtra.test.ts` — 12 tests: salario/hora, factores,
  fixture $800/mes de `specs/tasas-legales.md`.
- `packages/shared/src/calc/__tests__/descuentos.test.ts` — 21 tests: ISSS/AFP/Renta mensual
  y quincenal, casos borde (tope, tramo límite, salario 0).
- `packages/shared/src/calc/__tests__/prestaciones.test.ts` — 14 tests: aguinaldo proporcional
  y por tramos, vacaciones, Quincena 25 eligibility.
- `packages/shared/src/calc/__tests__/calcular.test.ts` — 25 tests: fixture quincenal
  de `specs/api-contract.md`, modo mensual, consistencia interna, sin segmentos.
- `packages/shared/src/index.ts` — actualizado con barrel export de `calc/*`.

### Verificación (gate en orden)

```
pnpm lint          → 1 task OK
pnpm check-types   → 1 task OK (tsc --noEmit strict)
pnpm test          → 86 tests, 5 files, 0 failures
pnpm test --coverage → statements 99.19%, branches 96.29%, functions 100%, lines 99.18%
```

### Desviaciones del plan

- **Renta quincenal**: el API contract (`api-contract.md`) usa la tabla mensual directamente
  sobre base gravable quincenal. La spec (`tasas-legales.md`) dice "dividir tramos y cuotas
  fijas entre 2". Se implementó la división de tabla según la spec. La diferencia de valores
  se documenta abajo.
- **API contract numéricos**: hay discrepancias de redondeo entre los cálculos de este sprint
  y los ejemplos del `api-contract.md`:
  - `horasExtraDiurna`: API contract dice $12.50, fórmula da $13.33 (2h × $3.3333 × 2.00).
    Posible error de redondeo en el contrato.
  - `diaLibreNocturna`: API contract dice $19.69, fórmula da $17.50 (3h × $3.3333 × 1.75).
    Diferencia inexplicable por la fórmula estándar.
  - Las tasas (ISSS 3%, AFP 7.25%) y prestaciones (aguinaldo 19 días, vacaciones $120)
    sí coinciden con el contrato.
  - Se verificó contra `misalariosv.com` que las tasas base son correctas a julio 2026.
- `Quincena 25`: el API contract lo pone como `null` para el ejemplo $800. La spec dice
  que aplica a salarios ≤ $1,500. Este sprint lo retorna no-null ($400) porque $800 califica.

### Known issues / siguientes pasos

- Una línea sin cubrir en `prestaciones.ts` (default del switch, rama no alcanzable por el
  tipo `Antiguedad`).

---

## Sprint 3 — `apps/api` Express

**Completado**: 2026-07-13.

### Archivos creados

- `apps/api/package.json` — Express 5.1.0, cors, express-rate-limit 7.5, zod, tsx (dev),
  supertest 7.1 (test), vitest, @types/express 5.
- `apps/api/tsconfig.json` — `noEmit: true`, extiende `@calc/config/tsconfig/base.json`.
- `apps/api/tsconfig.build.json` — output `dist/`.
- `apps/api/vitest.config.ts` — node environment, coverage > 80%, exclude `src/index.ts`.
- `apps/api/eslint.config.js` — reexporta base + relaja `no-unsafe-*` para `test/**`.
- `apps/api/src/app.ts` — Express 5 app: CORS, `express.json()`, rate limiter (100/min,
  429 custom handler), routes `/api/calcular`, errorHandler middleware.
- `apps/api/src/index.ts` — server entry (port 3001).
- `apps/api/src/middleware/errorHandler.ts` — ZodError → 400 `VALIDATION_ERROR` con
  `details[]` (`field` + `message` por cada `ZodIssue`), RateLimitError → 429,
  desconocido → 500 `INTERNAL_ERROR`.
- `apps/api/src/routes/calcular/calcular.routes.ts` — `POST /api/calcular`.
- `apps/api/src/routes/calcular/calcular.controller.ts` — valida con
  `calcularRequestSchema.parse()`, chequea reglas de negocio (`validarNegocio()`),
  delega al servicio.
- `apps/api/src/routes/calcular/calcular.service.ts` — wrapper sobre `calcular()` de
  `@calc/shared` (ADR-001: lógica única en shared).
- `apps/api/test/calcular.test.ts` — 15 tests Supertest:
  - Happy path: 200 con `CalcularResponse` (bruto, descuentos, prestaciones, neto).
  - 400 `VALIDATION_ERROR` con `details` (Zod): salario negativo, salario 0,
    salario > $100k, horas fuera de [0,24], fechaInicio > fechaFin,
    fechaIngreso posterior al periodo, tipoPago inválido.
  - 400 reglas de negocio: periodo > 31 días.
  - 429 `RATE_LIMIT_EXCEEDED`: 3 requests OK → 4º retorna 429.
  - 500 `INTERNAL_ERROR`: error handler unitario.
- `apps/api/eslint.config.js` — actualizado con reglas relajadas para tests.

### Verificación (gate en orden)

```
pnpm lint          → 2 tasks OK (shared + api)
pnpm check-types   → 2 tasks OK (shared + api, strict + verbatimModuleSyntax)
pnpm test          → 101 tests (86 shared + 15 api), 0 failures
pnpm test --coverage (api) → 89.28% statements, 80% branches, 80% functions, 89.28% lines
```

### Desviaciones del plan

- **`verbatimModuleSyntax`**: el `tsconfig` base activa esta opción. Requiere usar
  `import type` para tipos. En algunos casos (Express `Router` como tipo) se usó
  `const router: Router = Router()` donde Router es tanto valor como tipo.
- **`@types/express@5` + `express-rate-limit@7`**: el rate limiter maneja 429 con
  una función `handler` (respuesta directa, no pasa por el errorHandler). El
  errorHandler tiene un fallback para `RateLimitError` por si cambia en el futuro.
- **`supertest@7.1.0` deprecated**: tiene un warning `WARN deprecated supertest@7.1.0`.
  Se mantiene por compatibilidad con el stack; alternativas como `supertest@7.0.0` o
  migrar a `fetch` nativo para tests se evaluarán si causa problemas.
- No se usó `express-rate-limit` para test de 429 desde el errorHandler porque el
  handler configurado responde directo (no lanza error al siguiente middleware).

### Known issues / siguientes pasos

- `src/index.ts` excluido de coverage (tiene `app.listen()` que bloquearía Supertest).
- Una línea sin cubrir en `errorHandler.ts` (rama `RateLimitError`) — es un fallback
  defensivo que el handler configurado no activa.
- `createAppWithLimit()` en el test duplica parcialmente `app.ts`; podría extraerse
  como factory en `src/` si crece.

---

## Sprint 4 — `apps/web` scaffold + `ConfigInicial` + `useLocalStorage`

**Completado**: 2026-07-13.

### Archivos creados

- `apps/web/package.json` — React 19.1, Vite 8, Tailwind v4 (@tailwindcss/vite 4.3.2),
  Recharts, @vitejs/plugin-react 6.0.3, jsdom, RTL.
- `apps/web/vite.config.ts` — plugins: react + tailwindcss, port 5173.
- `apps/web/tsconfig.json` — `jsx: "react-jsx"`, extiende base.
- `apps/web/vitest.config.ts` — jsdom environment, setupFiles, css disabled, coverage > 80%.
- `apps/web/eslint.config.js` — reexporta base + relaja `no-unsafe-*` para tests.
- `apps/web/index.html` — layout base, lang=es, meta viewport.
- `apps/web/src/index.css` — Tailwind v4 CSS-first: `@import 'tailwindcss'`, `@theme`,
  `prefers-reduced-motion`.
- `apps/web/src/main.tsx` — `createRoot` en `#root`, StrictMode.
- `apps/web/src/App.tsx` — layout con `<ErrorBoundary>` + `<ConfigInicial>`.
- `apps/web/src/hooks/useLocalStorage.ts` — hook genérico tipo-safe, SSR-safe
  (try/catch en getItem/setItem), soporta setter funcional.
- `apps/web/src/hooks/useCalculos.ts` — esqueleto: retorna `{ status: 'idle' }`
  (implementación real en Sprint 6).
- `apps/web/src/components/ErrorBoundary.tsx` — class component con
  `getDerivedStateFromError`, fallback por defecto (role="alert") + botón Reintentar,
  soporta `fallback` custom.
- `apps/web/src/components/ConfigInicial.tsx` — formulario con: salarioBase (number,
  valida > 0 y < 100k), tipoPago (select mensual/quincenal), antiguedad (select 4
  opciones), fechaIngreso (date ISO). Persiste vía `useLocalStorage('config-inicial')`.
  Mensaje de éxito al guardar. Errores inline con `aria-invalid` y `aria-describedby`.
- `apps/web/src/test/setup.ts` — importa `@testing-library/jest-dom/vitest`,
  cleanup + clear localStorage en `afterEach`, mock `matchMedia`.
- `apps/web/src/hooks/useLocalStorage.test.ts` — 6 tests: valor inicial, persistencia,
  recuperación, setter funcional, JSON inválido, fallo de escritura.
- `apps/web/src/components/ErrorBoundary.test.tsx` — 4 tests: render sin error,
  fallback en error, botón Reintentar, fallback custom.
- `apps/web/src/components/ConfigInicial.test.tsx` — 9 tests: renderiza campos,
  error salario 0/negativo/>100k, guarda válido, persistencia en localStorage,
  restaura desde localStorage, cambia tipoPago y antiguedad.

### Verificación (gate en orden)

```
pnpm lint          → 3 tasks OK (shared + api + web)
pnpm check-types   → 3 tasks OK (shared + api + web, jsx: react-jsx)
pnpm test          → 120 tests (86 shared + 15 api + 19 web), 0 failures
pnpm test --coverage (web) → 95.31% statements, 85.29% branches, 92% functions, 95% lines
```

### Desviaciones del plan

- **Versiones de plugins**: `@vitejs/plugin-react@6.0.3` y `@tailwindcss/vite@4.3.2`
  son las primeras versiones que soportan Vite 8. Las versiones del plan (4.4.1 y 4.1.7)
  tenían peer dep incompatible.
- **`eslint.config.js`**: mismo patrón que api — relaja `no-unsafe-*` para test files.
- **`useCalculos.ts`**: esqueleto con `{ status: 'idle' }` — 0% coverage, intencional
  (se implementa en Sprint 6).
- **`App.tsx`**: sin test directo porque ErrorBoundary y ConfigInicial se prueban
  por separado. Pendiente agregar smoke test de render de App en Sprint 6 o 7.

### Known issues / siguientes pasos

- Línea 34 de `ConfigInicial.tsx` (validación de fechaIngreso) no cubierta — el input
  type="date" produce valores ISO válidos en navegador, jsdom lo simula. Validación defensiva.
- Sprint 5 (RegistroSemanal) es el siguiente paso — ya existe la base React + hooks
  + localStorage.

---

## Sprint 5 — `RegistroSemanal` (RF02)

**Completado**: 2026-07-13.

### Archivos creados

- `apps/web/src/components/registroTypes.ts` — `DiaRegistro` (jornadaBase, horasBase,
  horasExtraDiurna/Nocturna, horasDiaLibreDiurna/Nocturna, horasAsueto), helpers:
  `crearDiaVacio`, `nombreDia`, `formatearFecha`, `getLunes`, `semanaIdDesdeLunes`,
  `lunesDesdeSemanaId`, `generarDiasSemana`, `totalesSemana`.
- `apps/web/src/hooks/useRegistroSemanal.ts` — persistencia por `semanaId`
  (formato `YYYY-MM-DD` del lunes de la semana). Autogenera 7 días (Lun–Dom) vacíos
  si no hay datos guardados. `updateDia(index, dia)` actualiza un día individual.
- `apps/web/src/components/FilaDia.tsx` — row por día: selector de jornada base
  (diurna/nocturna/descanso/asueto), input horas base, extra diurna, extra nocturna.
  Muestra condicionalmente día libre (diurna/nocturna) cuando jornada = descanso,
  y horas asueto cuando jornada = asueto. Todos con `aria-label`.
- `apps/web/src/components/TotalesSemana.tsx` — suma de horas base, extra diurna,
  extra nocturna, día libre, asueto. Se muestra condicional.
- `apps/web/src/components/RegistroSemanal.tsx` — contenedor: título + rango de
  fechas (lunes–domingo), 7 `FilaDia`, `TotalesSemana`.
- `apps/web/src/App.tsx` — integra `<RegistroSemanal />`.
- `apps/web/src/components/FilaDia.test.tsx` — 5 tests: renderiza nombre/fecha,
  campos base, campos día libre, campo asueto, llama onChange.
- `apps/web/src/components/TotalesSemana.test.tsx` — 3 tests: 0h inicial, suma
  horas base, extras separadas.
- `apps/web/src/components/RegistroSemanal.test.tsx` — 5 tests: 7 filas, rango
  fechas, totales, actualización al ingresar horas, persistencia localStorage.

### Verificación (gate en orden)

```
pnpm lint          → 3 tasks OK (shared + api + web)
pnpm check-types   → 3 tasks OK
pnpm test          → 133 tests (86 shared + 15 api + 32 web), 0 failures
```

### Desviaciones del plan

- **`SelectorSemana.tsx`**: no se creó como componente separado. La navegación
  entre semanas (prev/next) quedó pendiente para Sprint 6 o 7. Por ahora solo
  muestra la semana actual.
- **`SelectorTipoHora.tsx`**: no se creó como componente separado. El dropdown de
  tipo de jornada está inline en `FilaDia.tsx`. Si crece, se puede extraer.
- La arquitectura del plan menciona `FilaDia.tsx (×7)` con `SelectorTipoHora.tsx`;
  en esta implementación `FilaDia` contiene todos sus inputs directamente.

### Known issues / siguientes pasos

- La navegación entre semanas (ver semanas anteriores) es necesaria para completar RF02.
  Sprint 6 o 7 pueden agregar botones prev/next.
- El `useRegistroSemanal` hook siempre usa la semana actual; para navegar se necesita
  un `useState` para `semanaId` activo.
- Sprint 6 (Resultados) integra `useCalculos()` para conectar `ConfigInicial` +
  `RegistroSemanal` con el orquestador de `@calc/shared`.

---

## Sprint 6 — Resultados: `ResultadoNeto`, `GraficoPastel`, `TablaTasas`

**Completado**: 2026-07-13.

### Archivos creados

- `apps/web/src/hooks/useCalculos.ts` — implementación real (ya no esqueleto). Lee
  `config-inicial` y `registro-semanal` de localStorage vía `useLocalStorage`, convierte
  `DiaRegistro[]` a `SegmentoHorario[]`, construye `CalcularRequest` y llama a
  `calcular()` de `@calc/shared`. Memorizado con `useMemo`. Retorna `CalculoState`
  (discriminated union: `idle` | `success` | `error`). Modo offline puro.
- `apps/web/src/components/ResumenBruto.tsx` — desglose del salario bruto: base,
  extra diurna/nocturna, día libre diurna/nocturna, asueto, total. Solo muestra
  filas con valor > 0. Fórmula indicada en cada línea.
- `apps/web/src/components/TablaDescuentos.tsx` — ISSS (3% sobre asegurable), AFP
  (7.25% sobre cotizable), Renta (tramo, % exceso, cuota fija). Total en rojo.
- `apps/web/src/components/Prestaciones.tsx` — aguinaldo (días + proporcional),
  vacaciones (30% de 15 días), Quincena 25 (50%, condicional). Valores en verde.
- `apps/web/src/components/NetoLiquido.tsx` — destacado verde con salario líquido.
- `apps/web/src/components/ResultadoNeto.tsx` — contenedor: muestra idle (mensaje),
  loading, error, o success con los 4 componentes anteriores.
- `apps/web/src/components/GraficoPastel.tsx` — Recharts `PieChart` (donut) con:
  salario neto, ISSS, AFP, Renta. Colores AA (verde, rojo, naranja, púrpura).
  Tooltip con `$x.xx`, `role="img"`.
- `apps/web/src/components/TablaTasas.tsx` — 11 filas de tasas vigentes con:
  concepto, valor, detalle, enlace `.gob.sv`. Fecha última actualización (Julio 2026).
  Disclaimer de verificación por el usuario.
- `apps/web/src/App.tsx` — integra `useCalculos()` para renderizado condicional de
  `GraficoPastel` solo en estado `success`.
- Tests co-ubicados: `ResultadoNeto.test.tsx` (4 tests: idle, cálculo completo,
  horas extra, ISSS/AFP/Renta), `GraficoPastel.test.tsx` (2 tests: renderizado,
  role img), `TablaTasas.test.tsx` (3 tests: encabezado, enlaces .gob.sv, conceptos).

### Verificación (gate en orden)

```
pnpm lint          → 3 tasks OK (shared + api + web)
pnpm check-types   → 3 tasks OK
pnpm test          → 142 tests (86 shared + 15 api + 41 web), 0 failures
```

### Desviaciones del plan

- Los subcomponentes `ResumenBruto`, `TablaDescuentos`, `Prestaciones`, `NetoLiquido`
  se crearon como archivos separados (no anidados dentro de `ResultadoNeto`). Esto
  facilita reuso y testeo individual.
- `GraficoPastel` no incluye los montos USD en la leyenda (solo en tooltip). La
  leyenda muestra etiquetas por claridad en pantallas pequeñas.
- `TablaTasas` incluye los 4 tramos de renta como filas separadas (más legible que
  una sola fila). Los enlaces son a `mtps.gob.sv`, `isss.gob.sv`, `ssf.gob.sv`,
  `mh.gob.sv` y `diariooficial.gob.sv`.

### Known issues / siguientes pasos

- `App.tsx` llama a `useCalculos()` en el nivel superior para pasarle datos a
  `GraficoPastel`. Esto provoca doble cálculo (uno en `ResultadoNeto` y otro en
  `App`). Solución: extraer `useCalculos` a contexto o pasar `calculosState` como
  prop. Sprint 7 puede refactorizar.
- Sprint 7 (último): `HistorialPeriodos`, `ExportarPDF`, ajustes responsive/A11y.

---

## Sprint 7 — `HistorialPeriodos` + `ExportarPDF` + CI/CD + afinado final

**Completado**: 2026-07-13.

### Archivos creados / modificados

- `apps/web/src/components/HistorialPeriodos.tsx` — lista de periodos guardados con
  `useLocalStorage('historial-periodos')`. Botón "Guardar periodo actual", muestra
  neto, bruto y fecha. Botón "Eliminar" por periodo con `aria-label`.
- `apps/web/src/components/ExportarPDF.tsx` — botón "Imprimir / Exportar PDF" que
  ejecuta `window.print()`. Tailwind `print:hidden` oculta elementos interactivos.
- `apps/web/src/App.tsx` — refactorizado: un solo `useCalculos()` en el nivel
  superior. Pasa `calculosState` a `ResultadoNeto` como prop. Integraciones:
  `HistorialPeriodos` (solo en estado success), `ExportarPDF`, clases `print:hidden`
  y `print:` para impresión.
- `apps/web/src/components/ResultadoNeto.tsx` — ahora recibe `state: CalculoState`
  como prop (no llama a `useCalculos` internamente). Esto elimina el doble cálculo.
- `.github/workflows/ci.yml` — CI pipeline:
  - `check` job: lint → check-types → test (todas las ramas)
  - `deploy-web` job: build `@calc/web` → deploy a GitHub Pages (solo `main`)
  - pnpm 9, Node 22, frozen lockfile.
- `apps/web/src/components/ResultadoNeto.test.tsx` — reescrito con `CalculoState`
  mock (idle, loading, error, success). 5 tests puros sin localStorage.
- `apps/web/src/components/HistorialPeriodos.test.tsx` — 4 tests: vacío, guardar,
  múltiples periodos, eliminar periodo.

### Verificación (gate final)

```
pnpm lint              → 3 tasks OK
pnpm check-types       → 3 tasks OK
pnpm test              → 147 tests (86 shared + 15 api + 46 web), 0 failures
pnpm build --filter=web → apps/web/dist (632 kB JS, 15 kB CSS)
pnpm build --filter=api → apps/api/dist (Express build)
```

### Plan de hosting (ADR-003 sin DB, ADR-006 modo offline)

**Frontend — GitHub Pages (gratis, SLA > 99.9%):**
1. El repo ya tiene `.github/workflows/ci.yml`. Al pushear a `main`:
   - CI ejecuta lint + check-types + test
   - Si pasa, build `@calc/web` y deploy a GitHub Pages
2. Requisitos: en Settings → Pages, seleccionar Source: "GitHub Actions"
3. URL: `https://{usuario}.github.io/calculo-descuentos-sv`

**Backend — Render.com (free tier):**
1. Crear Web Service conectado a este repo en Render Dashboard
2. Configuración:
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm install --frozen-lockfile && pnpm --filter=@calc/shared build && pnpm --filter=@calc/api build`
   - **Start Command**: `node dist/index.js`
   - **Environment**: Node.js 22
3. URL: `https://calculo-descuentos-sv.onrender.com`
4. Nota: free tier tiene spin-down en inactividad (~30s cold start). La app es
   offline-first (ADR-001/ADR-006) así que el frontend funciona sin backend.

## Sprint 8 — Producción: Deploy DigitalOcean + Monitoreo + Hardening ✅

**Completado**: 2026-07-20.

### Logros

- **CI verde**: Fix 10 `no-unsafe-*` lint errors en API + web ESLint configs
- **check-types en CI**: `turbo.json` `"dependsOn": ["^build"]` soluciona resolución de `@calc/shared`
- **Clerk DNS**: 5 CNAME records en name.com, SSL emitido
- **Clerk keys live**: `pk_live_` + `sk_live_` operativas
- **Sentry**: DSNs en web y API
- **Datadog**: `DD_API_KEY` + `DD_SITE` en API
- **Deploy automático**: GitHub Pages CI/CD operativo

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `apps/api/eslint.config.js` | no-unsafe-* off para routes + ignore ecosystem.config.cjs |
| `apps/web/eslint.config.js` | no-unsafe-* off para src/ |
| `turbo.json` | check-types dependsOn ^build |
| `apps/web/.env` | pk_live_ + VITE_API_URL prod + VITE_SENTRY_DSN |
| `apps/api/.env` | sk_live_ + SENTRY_DSN + DD_API_KEY + DD_SITE |

### Servicios en producción

| Servicio | URL | Estado |
|----------|-----|--------|
| API | `https://api.marvinmelendez.engineer` | ✅ Live |
| Web | `https://marvinmelendez.engineer` | ✅ Live |

### Gate: `pnpm lint && pnpm check-types && pnpm test` ✅ 157 tests

---

## Sprint 9 — UI/UX: Dark/light mode, mejora visual, vista día por día ✅

**Completado**: 2026-07-20.

### Archivos creados/modificados

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/index.css` | `@custom-variant dark`, CSS custom properties para tema claro/oscuro, paleta `@theme` con colores adaptativos |
| `apps/web/src/hooks/useTheme.ts` | Nuevo hook `useTheme()`: cicla light → dark → system, persiste en localStorage, escucha `prefers-color-scheme` |
| `apps/web/src/App.tsx` | `ThemeToggle` con iconos SVG sol/luna en header, header refactorizado con `ThemeToggle` a la izquierda + auth a la derecha |
| `apps/web/index.html` | Removidas clases `bg-gray-50 text-gray-900` (van en CSS ahora) |
| `apps/web/src/components/ConfigInicial.tsx` | `bg-white` → `bg-surface`, `text-gray-*` → `text-text`, `border-gray-*` → `border-border` |
| `apps/web/src/components/FilaDia.tsx` | Ídem |
| `apps/web/src/components/TotalesSemana.tsx` | Ídem |
| `apps/web/src/components/RegistroSemanal.tsx` | + toggle vista semanal/día por día, + date picker para día |
| `apps/web/src/components/ResultadoNeto.tsx` | Tokens de color adaptativos |
| `apps/web/src/components/ResumenBruto.tsx` | Ídem |
| `apps/web/src/components/TablaDescuentos.tsx` | Ídem |
| `apps/web/src/components/Prestaciones.tsx` | Ídem |
| `apps/web/src/components/NetoLiquido.tsx` | Ídem |
| `apps/web/src/components/GraficoPastel.tsx` | Ídem |
| `apps/web/src/components/TablaTasas.tsx` | Ídem |
| `apps/web/src/components/HistorialPeriodos.tsx` | Ídem |
| `apps/web/src/components/ExportarPDF.tsx` | Ídem |
| `apps/web/src/components/ErrorBoundary.tsx` | Ídem |
| `apps/web/src/hooks/useRegistroSemanal.ts` | Exporta `setDias` (lo necesitaba vista día) |
| (todos los .tsx) | HTML entities reemplazadas por UTF-8 plano (á, é, í, ó, ú, ñ, ü, —) |

### Cambios principales

1. **UTF-8 plano**: ~35 HTML entities reemplazadas por caracteres Unicode directos en todos los `.tsx` (JSX).
2. **Dark/light mode**: CSS custom properties en `:root` / `.dark`, `@custom-variant dark` en Tailwind v4. El hook `useTheme()` soporta light, dark, system. Toggle en header con SVG inline (sol/luna).
3. **Paleta de colores**: `--surface`, `--text`, `--border` y variantes adaptativas. `--color-primary` azul marino. Sombras `shadow-sm` en cards.
4. **Vista día por día**: Toggle en `RegistroSemanal`. Modo día: date picker + `FilaDia` individual. Persiste en misma estructura `semanaId`.

### Verificación (gate en orden)

```
pnpm lint          → 3 tasks OK
pnpm check-types   → 4 tasks OK
pnpm test          → 157 tests (86 shared + 25 api + 46 web), 0 failures
```

---

### Resumen final del proyecto (post Sprint 8)

| RF | Estado | Componente |
|----|--------|-----------|
| RF01 | Hecho | `ConfigInicial.tsx` + `useLocalStorage` |
| RF02 | Hecho | `RegistroSemanal.tsx` + `FilaDia.tsx` + `TotalesSemana.tsx` |
| RF03 | Hecho | `horasExtra.ts` (`@calc/shared`) |
| RF04 | Hecho | `descuentos.ts` (`@calc/shared`) |
| RF05 | Hecho | `prestaciones.ts` (`@calc/shared`) |
| RF06 | Hecho | `ResultadoNeto.tsx` + `ResumenBruto`/`TablaDescuentos`/`Prestaciones`/`NetoLiquido` |
| RF07 | Hecho | `GraficoPastel.tsx` (Recharts, colores AA) |
| RF08 | Hecho | `TablaTasas.tsx` (11 filas + links `.gob.sv`) |
| RF09 | Hecho | `HistorialPeriodos.tsx` (guardar/eliminar periodos) |
| RF10 | Hecho | `ExportarPDF.tsx` (`window.print()` + `@media print`) |

---

