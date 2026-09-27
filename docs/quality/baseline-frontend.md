# Baseline del frontend (Fase 0)

**Fecha:** 2026-09-20 · **Rama:** `feat/rediseno-tactile-editorial` · **Commit base:** `5722eb3`

## Comandos y resultados

| Comando | Resultado |
| --- | --- |
| `git status` | 13 archivos modificados (docs/specs) + sin seguimiento: `docs/ai-agents/`, plan SDD, spec visual nueva. Sin cambios de código al inicio. |
| `pnpm --filter=@calc/web test` | 21 archivos, **110 tests pasando**, 0 fallas. |
| `pnpm --filter=@calc/web build` | ✅ 476 ms. Bundle inicial **742.87 kB (213.21 kB gzip)** con advertencia de chunk >500 kB (FE-12). |
| `pnpm check` | ✅ 6/6 (install congelado, build, lint, tipos, coverage ≥80%, build). |

## Inventario rápido

- Componentes en `apps/web/src/components/`: 19 (+ tests co-ubicados).
- Tokens CSS: definidos en `@theme` de `index.css`; faltaban `bg` y `border-soft` con nombres
  del spec visual; existían alias históricos (`glass`, `sv-blue`) y clases sin token usadas en
  componentes (`bg-accent`, `text-accent`, `text-primary-light`, `bg-accent-soft`).
- localStorage keys: `config-inicial`, `jornada-config`, `entradas-periodo`, `incentivos`,
  `historial-periodos`, `theme-preference` (+ claves muertas limpiadas).
- Restricciones de entorno detectadas (no son fallos de código):
  - El MCP de Chrome no encuentra el canal `stable` (`/opt/google/chrome/chrome`); se usó
    `chromium` headless del sistema para capturas de evidencia.
  - jsdom sanitiza fechas imposibles en inputs `type="date"`; la validación FE-05 se prueba a
    nivel de función.

## Evidencia visual capturada (post-implementación, chromium headless)

Archivos en `/tmp/opencode/shots/` (no versionados): `web-{320,768,1280}-light.png` (dark por
defecto), `web-{320,768,1280}-lightmode.png` (tema claro), `web-{320,1280}-resultado.png`
(configuración válida: neto $683.53 visible antes de la captura en móvil) y `web-print.pdf`
+ `web-print-page-1.png` (impresión: fondo blanco, montos en negro, formularios ocultos).

## Después de la implementación (fases 2–4)

| Comando | Resultado |
| --- | --- |
| `pnpm --filter=@calc/web test` | 23 archivos, **147 tests pasando** (+37 de regresión). |
| `pnpm --filter=@calc/web build` | ✅ Inicial **371.97 kB (113.94 kB gzip, −46%)**; `GraficoPastel` (Recharts, 355.54 kB), `GuiaCalculos` e `HistorialPeriodos` diferidos. |
| `pnpm lint` / `pnpm check-types` | ✅ 4/4 cada uno. |
| `pnpm audit --prod --audit-level=low` | ✅ "No known vulnerabilities found". |
| `pnpm check` | ✅ 6/6. |
| `rg` técnicas prohibidas | Solo prohibiciones explícitas en docs/comentarios; cero en código vigente. |
