# Nota de sesión — 2026-09-27 — Auditoría P1/P2 (fases 0–4) y depuración App.test

> Handoff para continuar en nueva sesión. Estado verificado al cierre. Los documentos
> `docs/sesion-2026-07-*` son históricos (Clerk/SQLite supersedidos por ADR-011).

## Objetivo de la sesión

Auditar y corregir hallazgos residuales (P1/P2) de las fases 0–4 del plan
`docs/plan-frontend-calidad-sdd.md`, siguiendo flujo SDD (spec → código → tests → docs):

| Hallazgo | Estado |
| --- | --- |
| FE-08 orden accesible (resultado primero en DOM móvil; escritorio forma izq/resultado der con grid, sin `order-*`) | Código+tests pendientes de estabilizar (ver "Saga de App.tsx") |
| FE-03 límite de segmentos también en edición (proyección de estado candidato) | ✅ Implementado |
| Contrato estricto recursivo (`z.strictObject` en `segmentoHorarioSchema`/`incentivoSchema`) | ✅ Implementado |
| Regla 4 numérica en cliente (NaN/±Inf/negativos/rango, inline, no bloqueante) | ✅ Implementado |
| FE-06 foco al primer error en ConfigInicial | ✅ Implementado |
| Historial corrupto: `periodoGuardadoSchema.fecha` = timestamp ISO canónico | ✅ Implementado |
| Guard fechaIngreso para periodo histórico (no sustituir por hoy; error accionable) | ✅ Implementado |
| `useLocalStorage`: escritura en `useEffect` (updater puro, side-effects fuera de setState) | ✅ Implementado |
| Fixture `password=hunter2` → sentinel neutral | ✅ Hecho en `apps/api/test/calcular.test.ts` |
| Verificación de tasas legales con fuente primaria | Parcial (ver abajo) |

Sin commits, sin push. El árbol de trabajo = trabajo sin commitear del usuario (fases 0–4)
+ cambios de esta auditoría, mezclados en `git status` (51 archivos, +2795/−1168).

## Completado y verificado

### Specs (SDD-first, ya editadas)
- `openspec/specs/contrato-calcular.md`: estricto recursivo; en Zod 4.4.3 los issues
  `unrecognized_keys` traen path del **contenedor** (`segmentos.0`, `incentivos.0`) y
  mensaje `Unrecognized key: "clave"`; nota de decisión + rollback.
- `specs/api-contract.md`: espejo del estricto recursivo.
- `openspec/specs/captura-horas.md`: FE-03 validación de candidato en edición +
  `role="alert"`; Regla 4 inline en cliente; regla de fechaIngreso histórico.
- `openspec/specs/diseno-calculadora-clara.md`: FE-08 orden DOM + FE-06 foco.
- `openspec/specs/persistencia.md`: historial `fecha` = timestamp ISO UTC canónico;
  mecánica de `useLocalStorage` (escritura en effect, nunca en updater; escritura inicial
  al montar).
- `openspec/specs/integridad-calculo.md`: Regla 6 edición + estricto recursivo + fechaIngreso.

### Código
- `packages/shared/src/schemas.ts`: `segmentoHorarioSchema`/`incentivoSchema` →
  `z.strictObject`; `esTimestampIsoValido()` (regex `.mmmZ` + roundtrip `toISOString()`);
  `periodoGuardadoSchema.fecha` con `refine`; exportado por `export *` en index.
  **Importante:** tras editar shared, ejecutar `pnpm --filter=@calc/shared build` — apps
  consumen desde `dist`.
- `apps/api/test/calar.test.ts` → `calcular.test.ts`: tests 400 con claves desconocidas en
  arreglos (`segmentos.0`, `incentivos.0`); fixture `password=hunter2` reemplazado por
  `'internal-error-sentinel: detalle-interno'`. Suite API: **41 passed**.
- `packages/shared/src/__tests__/integridad.test.ts`: anidados + timestamp + historial
  corrupto (→ auto-sanado a `[]`). Suite shared: **129 passed**.
- `apps/web/src/components/EntradasPeriodo.tsx`: `validarFila` con `Number.isFinite`;
  `update()` valida proyección del estado candidato antes de `onChange` y bloquea con
  `avisoLimite` (role="alert").
- `apps/web/src/components/IncentivosForm.tsx`: `validarIncentivo` con no-finito/negativo/
  concepto > 100 chars.
- `apps/web/src/hooks/useCalculos.ts`: `filaCumpleReglaNumerica` (filas inválidas no
  alimentan cálculo, igual que fecha inválida); `incentivosValidos` filtra no-finito/
  negativo/concepto largo; guard histórico
  `!config.fechaIngreso && fechaFin < hoy` → error 'Definí la fecha de ingreso en
  Configuración para calcular un periodo histórico.'.
- `apps/web/src/components/ConfigInicial.tsx`: `validarConfig` no-finito (cadena else-if);
  `primerErrorConfig()` exportado; refs + foco al primer error en submit.
- `apps/web/src/hooks/useLocalStorage.ts`: reescrito — escritura en
  `useEffect([key, storedValue])`; `setValue = setStoredValue` (estable); escritura
  inicial al montar (aviso correcto en modo privado). Test de falla FE-15 y StrictMode OK.

### Tests web que pasan
- `EntradasPeriodo.test.tsx` (25): FE-03 (99→100 permitido; 100→101 bloqueado vía fila con
  fecha inválida; asueto al límite bloqueado con harness controlado; editar fechas
  inválidas) + Regla 4 unit.
- `IncentivosForm.test.tsx`: Regla 4 con harness controlado (`Contenedor` con `useState`
  + `onChange={setIncentivos}` — con mock de `onChange` los props no cambian y los
  errores no aparecen).
- `ConfigInicial.test.tsx`: FE-06 foco + `primerErrorConfig` + validarConfig no-finito.
- `useLocalStorage.test.ts`: reescrito (mount-write, FE-15 falla/recuperación, StrictMode).
- `useCalculos.test.ts` (17): Regla 4 skip, guard histórico, `incentivosValidos` puros.
- `HistorialPeriodos.test.tsx` (10): clave corrupta → `'[]'`, timestamp canónico.

### Verificación de tasas (parcial — sin cambios numéricos)
- Fuente oficial MTPS (.gob.sv) confirma: Quincena 25 (50%, tope $1,500, 15–25 enero,
  sin renta/ISSS/AFP; obligatorio sector público 2026, privado 2027) y hora extra diurna
  2.00× (Art. 169 CT; FAQ MTPS 2025-11-24).
- ISSS 3%/tope $1,000, AFP 7.25%/tope $6,843.48, tabla renta (Decreto 293): solo fuentes
  secundarias coincidentes → verificación primaria PENDIENTE.
- Extra nocturna 2.25×: el ejemplo aritmético de MTPS es ambiguo ($3.74 ≈ 2.49×
  implicaría 2.5×). **No cambiar la tasa**; documentar como pendiente en
  `specs/tasas-legales.md` (sección de estado de verificación) y NO tocar
  `FECHA_ACTUALIZACION_TASAS`.

## Saga de App.tsx (estado crítico — leer antes de tocar)

1. `src/App.tsx` quedó **roto** por cirugías de diagnóstico (probe `node:fs` +
   `ReferenceError: GuiaCalculos is not defined` en línea 186).
2. **Recuperación hecha**: el App.tsx original del usuario vive en el commit huérfano
   `2f52735af734897d7b6b77ccef4c6dd17c6cba42` (stash poblado antes del primer pop — los
   stash pops dejan dangling commits; listar con `git fsck --unreachable | grep commit`).
   Copia segura: `/tmp/opencode/App.usuario.tsx` (clases `panel`/`site-header`, lazy de
   GraficoPastel/HistorialPeriodos/GuiaCalculos, `order-2` captura / `order-1` resultado).
3. `src/App.tsx` actual = `App.usuario.tsx` restaurado (recuperado, SIN probe).
4. Otras copias en `/tmp/opencode/` (volátil): `App.DEFINITIVO.tsx` (mi versión FE-08:
   resultado primero en DOM con `lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24`,
   captura segunda con `lg:col-start-1 lg:row-start-1 print:hidden`, lazy+Suspense
   intactos, sin clases `order-*`), `App.final.tsx`, y `*.mine` de componentes/hooks.
5. **Aprendizaje de depuración**: los "cuelgues" de vitest fueron en gran parte artefacto
   de `git checkout HEAD -- <archivo>` que mezcló estados (hook 2-tupla de HEAD +
   `AppContext.tsx` del usuario que espera 3-tupla → `TypeError: Cannot read properties
   of undefined (reading 'ok')` en `AppContext.tsx:69`). Con archivos consistentes todo
   corre. `lazy`+`Suspense` dentro de `act` funciona aislado (sondeo-lazy pasó en 710ms).
6. Con App del usuario + todo lo demás mío, el último `sondeo.test.tsx` quedó sin señal
   clara (inconcluso) — **primer paso de la nueva sesión**: correr
   `cd apps/web && NODE_OPTIONS=--no-experimental-webstorage npx vitest run src/__tests__/App.test.tsx`
   para medir el estado real. HEAD (todo de HEAD) PASA completo: 147 tests, 23 archivos.

### Fallos pendientes en `apps/web/src/__tests__/App.test.tsx` (5)
1. 'exceden 24 y no las calcula': esperar el comportamiento nuevo por spec — fila omitida
   (`filaCumpleReglaNumerica`) + alerta visible, no estado de error de cálculo.
2-3. FE-08 DOM/orden: `main.children[0]` = columna resultado y clases
   `lg:col-start-2`/`lg:col-start-1` — requieren aplicar FE-08 sobre el App.tsx
   del usuario (swap de bloques + clases, sin `order-*`).
4. Teclado: 2º tab cae en columna resultado (ExportarPDF).
5. FE-15 'aviso accionable': con escritura-al-montar, revisar mock de `setItem`
   (`mockImplementationOnce` puede consumirse en el montaje → usar `mockImplementation`).

## Próximos pasos (orden sugerido)

1. `cd apps/web && NODE_OPTIONS=--no-experimental-webstorage npx vitest run src/__tests__/App.test.tsx`
   con el árbol actual (App del usuario). Eliminar `src/__tests__/sondeo.test.tsx`,
   `sondeo-lazy.test.tsx` y probes si quedaron.
2. Aplicar FE-08 sobre el App.tsx del usuario: mover bloque `<section>` de resultado
   ANTES de la columna captura en el DOM (móvil), y en desktop posicionar con
   `lg:col-start-2 lg:row-start-1` (resultado) + `lg:col-start-1 lg:row-start-1`
   (captura) dentro de un grid `lg:grid-cols-2`; quitar `order-*`. Ajustar los 2 tests
   DOM/teclado de App.test.
3. Corregir 'exceden 24' y FE-15 según lo de arriba. Suite web completa verde.
4. Documentar verificación de tasas en `specs/tasas-legales.md` (estado 2026-09-20,
   pendientes ISSS/AFP/Renta primaria y 2.25×).
5. Trazabilidad `docs/quality/requirements-traceability.md` (FE-06/FE-08 + filas
   nuevas) y entrada de CHANGELOG de la auditoría (existe entrada del usuario del
   2026-09-20 para fases 0–4; añadir la de esta auditoría).
6. Validación final: `pnpm --filter=@calc/shared test` (129), `--filter=@calc/web test`,
   `--filter=@calc/api test` (41), `pnpm lint`, `pnpm check-types`, `pnpm build`,
   `pnpm check`, `pnpm audit --prod --audit-level=low`, `git diff --check`.
7. Lighthouse/axe vía chrome-devtools si hay navegador; documentar si axe no está
   instalado. Informe final de 8 puntos al usuario.

## Aprendizajes técnicos clave

- Zod 4.4.3: `unrecognized_keys` → path del contenedor, mensaje `Unrecognized key`.
- `@calc/shared` se consume desde `dist` — reconstruir tras cada cambio.
- jsdom sanitiza `input type=date` y `type=number` (`1e999` → `''` → 0): Regla 4 se
  prueba a nivel función; en UI, harness controlado.
- `JSON.stringify(Infinity)` → `null`: parser descarta la clave completa (Regla 8);
  el camino real de montos no finitos es en-sesión (memoria).
- `user.selectOptions` dispara onChange más de una vez (input+change).
- No mezclar versiones HEAD de hooks con AppContext del árbol (tupla 2 vs 3).
- Env de tests web: `NODE_OPTIONS=--no-experimental-webstorage` (viene del script).
- Riesgo `/tmp`: los respaldos son volátiles; el commit huérfano `2f52735` sobrevive
  hasta un `git gc` — si se necesita persistencia, re-copiar de ahí.

## Comandos de referencia

```bash
pnpm --filter=@calc/shared build         # tras editar packages/shared/src
pnpm --filter=@calc/shared test          # 129 expected
pnpm --filter=@calc/api test             # 41 expected
cd apps/web && NODE_OPTIONS=--no-experimental-webstorage npx vitest run src/__tests__/App.test.tsx
git fsck --unreachable | grep commit     # recuperar stash poblado
git show 2f52735:apps/web/src/App.tsx    # App original del usuario
```
