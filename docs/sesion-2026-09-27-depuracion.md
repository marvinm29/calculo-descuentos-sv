# Sesión 2026-09-27 — Depuración de mantenimiento (higiene de codebase)

Estado: ejecutada y verificada. Clasificación: mantenimiento + bug de contenido.

## Alcance

Auditoría completa del monorepo (web, api, shared, config, raíz, CI) con dos subagentes de
exploración + verificación manual de cada hallazgo de severidad alta antes de tocar código.
Checkpoint previo del trabajo sin commitear: commit `02c44ca`.

## Hallazgos y acciones

| # | Hallazgo | Acción | Evidencia |
|---|----------|--------|-----------|
| 1 | Motor de renta usaba `bg - desde` (550.01) en vez de la columna "Sobre el exceso de" de la tabla oficial (550.00) — desviaba de `specs/tasas-legales.md` § Formula | `excesoDesde` codificado en `RENTA_TRAMOS_MENSUAL` (se divide /2 para quincenal); motor y guía usan esa columna; guía deriva ejemplos de `calcularDescuentos` | `tasas.ts`, `descuentos.ts:72`, `GuiaCalculos.tsx`; regresión `bg=563.45 → 19.02` |
| 2 | `TablaDescuentos` mostraba la cuota fija como base del exceso ("10% sobre exceso de $17.67") | Copy corregido + test de regresión | `TablaDescuentos.tsx:32-36` |
| 3 | Contradicción en CHANGELOG (decía que `JornadaConfig` "permanece exportado") y CONTEXT.md citaba el recargo de nocturnidad retirado | Corregidos ambos | CHANGELOG, CONTEXT.md |
| 4 | Residuos de Clerk: mock en `apps/web/vitest.config.ts` y `clerk-react/` en `.gitignore` | Eliminados (ADR-011) | `vitest.config.ts`, `.gitignore` |
| 5 | Rama `RateLimitError` inalcanzable en `errorHandler` (express-rate-limit v7 no lanza ese error; verificado en `node_modules`) | Eliminada + test sintético reemplazado por test honesto de 500; mensaje 429 unificado en `MENSAJE_RATE_LIMIT` | `errorHandler.ts`, `app.ts` |
| 6 | `tests/` vacío en raíz, `tee /dev/null` en `check.sh`, subpaths `./tasas|./types|./schemas` sin consumidor | Eliminados | raíz, `packages/shared/package.json` |
| 7 | JSDoc ausente en todo `calc/*.ts`; valores de tasas duplicados en comentarios de `types.ts`; 30/8 y 100000 hardcodeados fuera de la fuente única | JSDoc con base legal en el motor; `DIVISORES_SALARIO` y `MAX_SALARIO_BASE` en shared; comentarios de unidades sin valores | `packages/shared/src/calc/*` |
| 8 | CI no ejecutaba `pnpm coverage` (thresholds 80% solo locales) | El job `check` de CI ejecuta cobertura (timeout 15 min) | `.github/workflows/ci.yml` |

## No-alcance (decidido explícitamente)

- ADRs en `.agents/adr/` siguen **locales** (decisión del usuario 2026-09-27); `specs/architecture.md`
  los referencia. Riesgo documentado: si se pierde la copia local, se pierde la autoridad #3.
- `RECARGO_NOCTURNIDAD`, `JORNADA`, `DIAS_ASUETO_FIJOS`, `PORCENTAJE_PATRONAL`: retención
  intencional como referencia legal documentada (ver CHANGELOG 2026-09-27 y `tasas-legales.md`).
- Schemas de `@calc/shared` de uso interno siguen exportados (superficie pública documental).

## Verificación (evidencia reproducible)

```
pnpm lint            ✅ 4 tasks
pnpm check-types     ✅ 4 tasks
pnpm test            ✅ 131 (shared) + 41 (api) + 168 (web)
pnpm coverage        ✅ thresholds 80% por paquete, sin caché
```

Cobertura destacada: `errorHandler.ts` 100% en todas las métricas tras eliminar la rama muerta.

## Riesgos residuales

- La corrección de renta cambia el resultado en $0.01 solo cuando el excedente cae en el
  límite exacto de redondeo (ej. bg = $563.45): motor antes $19.01, ahora $19.02 (fiel a la
  tabla MH). Los fixtures del `api-contract.md` no cambian.
- `round2` sigue siendo half-up sobre doubles: en `.xx5` exactos la deriva binaria puede
  redondear hacia abajo; documentado en el JSDoc de `round2` como limitación conocida del motor.
- La equivalencia UI↔shared↔API de validaciones (Regla 4, límites) se mantiene a mano; los
  límites ahora provienen de `LIMITES_CONTRATO`, pero las reglas numéricas siguen duplicadas
  por diseño de la captura inline.