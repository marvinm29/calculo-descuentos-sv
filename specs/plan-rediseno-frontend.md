# Plan: Rediseño Frontend "Tactile Editorial + toque Liquid Glass"

> Fuente de la sesión de planificación (2026-08-30). Este documento **es** el plan:
> las sesiones futuras lo toman como origen antes de tocar código.
> Último estado de referencia: `main @ 15a9bd5` (Sprint 10b).

---

## 1. Contexto y objetivo

- El usuario no es diseñador: quiere que el **agente tome las decisiones de diseño**
  con criterio de ingeniero senior, no que él adivine.
- Rediseñar el frontend con lo mejor de las tendencias 2026, **sin que parezca hecho por IA**.
- **Accesibilidad es piso, no adorno**: ambos modos (light/dark), contraste WCAG AA mínimo.
- El WIP anterior (`feat/modern-frontend-2026`, commit `602e93b`) queda **deprecado como referencia**.
  Se reutilizan selectivamente sus piezas buenas (ver §7).

### Decisiones confirmadas

1. **Dirección de diseño**: "Tactile Editorial + toque Liquid Glass" (aprobado).
2. **Descartar WIP**: parqueado en `feat/modern-frontend-2026` (commit-checkpoint `602e93b`), no borrado.
3. **Eliminar Clerk**: es una utilidad pública; no se usa. Se quita `@clerk/react`, `@clerk/express`,
   carpeta `clerk-react/`, `apps/api/src/routes/history/` y SQLite. API queda stateless
   (solo `POST /api/calcular`). Volver a ADR-003 puro (persistencia solo localStorage).
4. **Persistir este plan** en `specs/plan-rediseno-frontend.md` (este archivo).

---

## 2. Research aplicado (fuentes)

| Fuente | Hallazgo clave | Uso |
|---|---|---|
| [AIToolPick — 30-point AI-look checklist](https://aitoolpick.org/blog/ai-generated-website-checklist/) | Tells de diseño IA: gradiente púrpura→azul, Inter/Roboto, 3 cards idénticas, shadow en todo, >3 colores | **Checklist de auditoría** antes de dar por terminado cada sprint de UI |
| [Superdesign — 5 fixes](https://superdesign.dev/blog/how-to-make-ai-ui-look-less-generic) | Separar creativo de implementación; extraer design system ANTES de generar pantallas; specs explícitas; motion con propósito | Estructura del Sprint 2 (DESIGN.md primero, UI después) |
| [Fireart — Tactile Brutalism 2026](https://fireart.studio/blog/the-best-web-design-trends/) | El trend anti-IA: geometría dura, borders 1px, **cero sombras difusas**, tipografía como arquitectura, números mono/tabular, profundidad vía CSS no blur | Base estética del rediseño |
| [Figma — Web Design Trends 2026](https://www.figma.com/resource-library/web-design-trends/) | 3D, nav experimental, bold typography, sustainable/accessible web | Contexto de tendencias |
| [Identiti — Liquid Glass sin romper usabilidad](https://www.identitidesign.com/blog/liquid-glass-adaptive-transparency/) | El blur mal usado **destruye contraste** (problema de accesibilidad, no de gusto). Reglas: glass en chrome, no en contenido; contraste garantizado; respetar reduced-motion/transparency | Cómo aplicar liquid glass sin romper WCAG |
| [DesignMonks — Liquid Glass UI](https://www.designmonks.co/blog/liquid-glass-ui) | Apple reserva el glass para overlays/modales/nav; sobre las tarjetas de contenido es bevel-emboss 2000s | Dónde aplicar glass (3 lugares) |

### Referentes de criterio (estudios elite — se copia criterio, no píxel)

| Estudio | Qué copiar |
|---|---|
| Locomotive | Scroll + editorial con peso |
| Awwwards Studio | Tipografía bold + motion medido |
| Digital Elegance | WCAG 2.2 AAA sin sacrificar belleza |
| Narrative Design | White space + micro-copy; "lento por diseño" |
| DesignCode | Dashboards fintech simples y exactos |

---

## 3. Dirección de diseño (decisión)

**"Tactile Editorial + toque Liquid Glass"** — lo trending de 2026 aplicado con criterio.

| Elemento | Decisión | Por qué |
|---|---|---|
| Base | Tactile Editorial: borders 1px, sin sombras difusas, radio pequeño (2px) | Trend anti-IA (Fireart); contraste AA nativo |
| Liquid glass | **Solo 3 lugares**: nav sticky, diálogos/modales, y el resumen del resultado (panel cristal) | Apple lo reserva para overlays; un solo panel glass = "cuidado", no "template" |
| Light/Dark | Tokens para ambos; contraste AA chequeado en ambos. Dark-first opcional | Requisito explícito |
| Números | Monospace (`tabular-nums`) en **todos** los montos | Detalle "engineered": columnas alineadas, exactitud |
| Acento | **Un solo** color — SV Blue `#003b6f` (light) / `#7ab2e0` (dark) | La bandera; "de marca", no "de plantilla" |
| Tipografía | Display: *Fraunces* (serif editorial). Body: *Onest* (ya en repo). Montos: *JetBrains Mono* | Serif + mono = sello awwwards; nadie usa serif en SaaS genérico → no parece IA |
| Motion | framer-motion (ya en deps), solo micro-interacciones: números que se animan al recalcular, hover sutil | "Engineered", no "slop" |
| Iconos | lucide-react (ya en deps), SVG — sin emoji | Checklist anti-IA |

### Prohibiciones (slop starter pack — para cada sprint de UI)

- ✕ Gradiente púrpura→azul (el WIP lo tenía: `#6366f1→#06b6d4`) — **eliminado**
- ✕ Orbes flotantes con blur (`bg-orbs`) — **eliminado**
- ✕ Botones con shimmer (`btn-accent`) — **eliminado**
- ✕ `glass-card` sobre todo el contenido (blur + shadow en cada card) — **eliminado**
- ✕ Inter/Roboto/Open Sans como primaria
- ✕ 3 cards idénticas repetidas en secciones
- ✕ Sombras a 0.1 de opacidad en todo
- ✕ >3 colores compitiendo
- ✕ Emoji como iconos

---

## 4. Mapa SWEBOK v4 (aplicado, no ceremonial)

| KA (SWEBOK v4) | Dónde vive en el plan |
|---|---|
| Software Requirements | `specs/requirements.md` RF02 reescrito + proposals OpenSpec (deltas ADDED/MODIFIED/REMOVED) |
| Software Architecture | ADRs en `.agents/adr/` (001 shared único, 003 persistencia híbrida, 006 offline, 010 día-por-día, 011 design system) |
| Software Construction | skill `tdd` en cada delta; `react-vite-tailwind4` para componentes |
| Software Testing | `vitest-rtl-supertest`; gate `lint && check-types && test` + coverage >80% |
| Software Security | Sprint 5 + §8 |
| Software Engineering Management | Sprints documentados en `specs/sprints.md` (skill `sprint-workflow`) |
| Software Quality | Gate por sprint + auditoría anti-AI + lighthouse a11y |
| SE Models & Methods | OpenSpec delta tracking como modelo de cambio |

---

## 5. Stack de skills + agentes/subagentes

| Fase | Skill | Subagente |
|---|---|---|
| Descubrir/entender | `improve-codebase-architecture`, `research` | `explore` (deep dive código/docs) |
| Congelar dominio | `domain-modeling`, `grill-with-docs` | — |
| Proponer | `to-spec` → `to-tickets` | `general` (proposals en paralelo) |
| Ejecutar | `implement` + `tdd` | — |
| Revisar | `code-review` (eje Standards + Spec) | 2 subagentes **en paralelo** |
| QA visual | `customize-opencode` para crear subagente "visual-auditor" (chrome-devtools + checklist anti-AI) | `general` |
| Cerrar | `sprint-workflow`, `retro` | — |

---

## 6. Verdad actual a congelar (OpenSpec) + ADRs

- Congelar en `openspec/specs/`: `dominio-calculo`, `captura-horas`, `contrato-calcular`, `persistencia`.
- ADRs: 001/003/006/010/011.
- En el mismo PR (docs-only): corregir `architecture.md` (EntradasPeriodo, no SemanaExtrasCard),
  `api-contract.md` (fixture a favor de la fórmula — Sprint 2 eligió `tasas-legales.md`),
  `redisenio-jornada-incentivos.md` (10a ejecutado y **superado por 10b**),
  `CONTEXT.md` (vocabulario real), puntero en `sprints.md` a `openspec/specs` como source of truth.

---

## 7. Sprints

| # | Sprint | Contenido | Salida verificable |
|---|---|---|---|
| 0 | **Foundation** | Gate del estado limpio (`main` nuevo) → OpenSpec init + freeze + ADRs + docs | `pnpm lint && check-types && test` verde, cero diffs runtime |
| 1 | **Dominio: jornada simplificada + sin Clerk** | Quitar `horasSemanales`/`tipo` de `JornadaConfig` → solo `modalidad`; JornadaSelector sin input de horas ni promesa de exceso; RF02 reescrito; **cálculo a la carta** (entrar extras sin declarar semana) probado; recargo nocturnidad desacoplado y testeado; **eliminar Clerk + SQLite + `clerk-react/` + `routes/history/`**; API → solo `POST /api/calcular` | TDD: tests rojos→verde + gate |
| 2 | **Design system** | `DESIGN.md` (tokens, escala tipográfica, spacing, radius, elevación) → reescribir `index.css`: matar orbes/gradiente/shimmer/glass-total; base editorial + glass solo en nav/modal/resultado; paleta SV Blue; tabular figures | Screenshot baseline + gate |
| 3 | **Componentes + layout** | Reutilizar piezas buenas del WIP (`ui/` Radix, `useToast`, zod cliente); layout 2 columnas, header sticky glass, resumen cristal; light/dark | Screenshots + gate |
| 4 | **Motion + accesibilidad** | Micro-interacciones con propósito, focus rings, `prefers-reduced-motion`, print, touch ≥44px, responsive | Lighthouse a11y + gate |
| 5 | **Seguridad + cierre** | Dependabot, `npm audit` en CI, CORS restringido, CSP via Vite, `calculos.db`/`.env` gitignored, docs finales, `retro` | Gate + checklist anti-AI sobre screenshots |

### Qué se reutiliza del WIP (`feat/modern-frontend-2026@602e93b`)

> **Decisión 2026-08-30 (Sprint 13)**: NO se reintroducen los paquetes del WIP
> (Radix, TanStack, framer-motion, zod cliente, lucide). El usuario descartó el WIP;
> los componentes actuales usan elementos nativos accesibles que ya funcionan y se
> restilizan con los tokens de `DESIGN.md`. Mantener dependencias mínimas
> (regla AGENTS.md: no deps nuevas sin verificar). El WIP queda como referencia de
> proceso, no de código a copiar.

- `DESIGN.md` (nuevo) define el sistema; `index.css` lo implementa (Sprint 12).
- Componentes existentes se restilizan (borders táctiles, `.amount` mono, glass en nav/neto).

### Qué NO va en estos sprints

- Kit Radix/Framer/TanStack Form como tema — solo se usan si un sprint lo requiere.
- Recalcular historial en servidor (historial local, ADR-003 puro).
- Cambiar la heurística fechas×7 salvo proposal nuevo con base legal.

---

## 8. Ciberseguridad (SWEBOK Security KA)

React/Zod dan base segura. Sprint 5 cierra lo barato:
- Secrets solo en `.env` (gitignored). Verificar que no haya `.env` trackeado.
- CORS whitelist real (solo origin del frontend).
- CSP via Vite (o headers en API).
- Rate-limit ya activo en API (100/min) — se conserva.
- `npm audit` + Dependabot en CI.
- `calculos.db` fuera del repo.
- Al quitar Clerk: sin tokens de auth, superficie de ataque se reduce.

---

## 9. Verificación (no negociable)

Cada sprint/PR:

```bash
pnpm lint && pnpm check-types && pnpm test
```

Además:
- [ ] `openspec/specs/` describe el código que acaba de aterrizar.
- [ ] `CONTEXT.md` usa los mismos nombres que `types.ts`.
- [ ] Ninguna UI afirma un cálculo que `useCalculos` / `calcular()` no ejecuten.
- [ ] `tasas.ts` y `tasas-legales.md` se mueven juntos.
- [ ] Screenshots pasan el checklist anti-AI (30 puntos de AIToolPick adaptado).
- [ ] Contraste AA en light y dark (verificado, no asumido).

---

## 10. Estado del repo al inicio

- Branch: `feat/rediseno-tactile-editorial` (desde `main @ 15a9bd5`), árbol limpio.
- WIP deprecado: `feat/modern-frontend-2026 @ 602e93b` (referencia, no se trabaja ahí).
- `clerk-react/` trackeado en `main` → se elimina en Sprint 1 (commit real).

---

## 11. Ejecución (actualización 2026-08-30)

| Sprint | Estado | Resumen |
|---|---|---|
| 0 (11a) | ✅ | Freeze OpenSpec + ADRs + docs + fix entorno Node 26 |
| 1 (11b) | ✅ | Jornada = solo modalidad; sin Clerk/SQLite/clerk-react; cálculo a la carta con tests |
| 2 (12) | ✅ | `DESIGN.md` + `index.css` reescrito (tactile editorial + glass nav/panel) |
| 3 (13) | ✅ | Layout 2 columnas + header glass sticky + tokens/`.amount`; **sin Radix del WIP** |
| 4 (14) | ✅ | `num-pop`, `accent-color`, print sólido, touch ≥44px |
| 5 (15) | 🔶 | CORS restringido + Dependabot + audit CI + auditoría anti-AI hechas; falta revisión visual |

**Decisiones tomadas durante ejecución:**
- No reintroducir Radix/TanStack/framer/lucide del WIP (deps mínimas; componentes nativos restilizados).
- El `index.css` del WIP (orbes, gradiente, glass-total, shimmer) se **eliminó** por completo.