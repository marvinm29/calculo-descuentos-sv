# Plan SDD: Rediseño Frontend "Linear Instrument" (SV Blue)

> Fuente de la sesión de planificación (2026-08-30). **Supercede** a
> `specs/plan-rediseno-frontend.md` en la dirección de diseño: el usuario calificó el
> "Tactile Editorial" como *"muy básico y no me convence"*.
> Este documento **es** el plan SDD: las sesiones futuras lo toman como origen antes de tocar código.
> Branch de trabajo: `feat/rediseno-tactile-editorial` (se mantiene el nombre de rama).

---

## 1. Contexto y objetivo

- El usuario no es diseñador: el **agente toma las decisiones de diseño** con criterio de
  ingeniero senior, basado en investigación (no en gusto arbitrario).
- Objetivo: reemplazar la estética "Tactile Editorial" (minimalista de aire) por una dirección
  **"Linear Instrument"**: densa, tool-like, dark-first, con micro-estados de nivel craft.
- **Accesibilidad es piso**: contraste WCAG AA en light y dark; `prefers-reduced-motion`;
  focus rings diseñados (no browser default).

### Decisiones confirmadas

1. **Dirección de diseño**: "Linear Instrument" con identidad SV Blue (aprobado en investigación).
2. **Supercede**: `plan-rediseno-frontend.md` en §3 Dirección (tokens y look cambian; sprints 0/1
   del otro plan ya entregaron dominio + sin Clerk y NO se rehacen).
3. **Sin deps nuevas**: no se añaden librerías de UI (Radix, shadcn, framer, lucide quedan fuera —
   regla AGENTS.md). Los micro-estados se hacen con CSS puro.

---

## 2. Research aplicado (fuentes primarias, 2026-08-30)

| Fuente | Hallazgo clave | Uso |
|---|---|---|
| [Mantlr — How Stripe, Linear, and Vercel Ship Premium UI](https://mantlr.com/blog/stripe-linear-vercel-premium-ui) | Lo premium no son hex values sino: **interaction density**, **typography as brand anchor** (una sola familia + mono), **color as restraint** (por significado, no decoración), **crafted microstates** (6 estados), **respect for physical metaphor** (`scale:0.97`), **obsession with the specific case** | Checklist de craft por componente |
| [DesignMD — Linear tokens medidos](https://designmd.cc/benchmarks/linear) | Dark-first `#0F1011`/`#08090A`; texto `#F7F8F8`; borders `#2A2E33`; acento indigo `#5E6AD2`; escala radius 4/6/12px; `transform: scale(0.97)` en active; profundidad con 1px borders + inset, no drop shadows | Referencia de tokens (traducidos a SV Blue) |
| [Brainy Papers — Why Every SaaS Looks the Same in 2026](https://brainy.ink/paper/why-every-saas-looks-the-same-2026) | El "dark SaaS" (Linear/Vercel/Resend/Cal/Posthog) ya es el nuevo genérico | Advertencia: NO copiar Linear tal cual; diferenciar con identidad propia (SV Blue + layout de instrumento) |
| [Goodface — Top 10 FinTech interfaces](https://goodface.agency/insight/top-10-fintech-product-interface-designs/) | Stripe = "dense but intuitive"; los mejores fintech usan **color para significado** y distinta identidad visual, no "todas iguales" | Contraste con la investigación: cálculos financieros piden densidad + claridad |
| [Krirox — anti-ai-slop-skills](https://github.com/Krirox/anti-ai-slop-skills) | Slop = "distributional convergence"; 4 causas raíz (no hierarchy, no specificity, no restraint, no opinion); 10-dimension/30-point rubric | Rubric de auditoría final sobre screenshots |

### Síntesis (el argumento)

Los seniors (Linear, Vercel, Stripe, Resend, Raycast) convergen en **craft sobre decoración**:
una sola tipografía sans + mono para datos, escala de grises + un acento, micro-estados completos,
`scale(0.97)`, denso y tool-like. El error del "Tactile Editorial" fue aplicar *restraint* sin
*density*: quedó vacío. La corrección no es añadir color/glass, es **añadir densidad, jerarquía y
micro-craft** manteniendo la restricción.

---

## 3. Dirección de diseño (decisión congelada)

**"Linear Instrument" — dark-first, tool-like, con identidad SV Blue.**

| Elemento | Decisión | Fuente |
|---|---|---|
| **Fondo** | Dark-first `#0C0D0F` (near-black, no puro); light `#F5F6F7` (neutral frío, no papel cálido) | Linear: dark-first nativo |
| **Superficies** | `#141517` cards; `#1A1B1E` raised/hover; border 1px `#26282D` | Linear |
| **Tipografía** | **Solo Onest** (sans, única familia como ancla) + JetBrains Mono (montos, tabular). Se **elimina Fraunces** (display serif) — una sola familia + mono | Mantlr: typography as brand anchor |
| **Acento** | **SV Blue** `#3B82F6`-family visible en dark (`#60A5FA` dark / `#1D4ED8` light) — la bandera, no indigo genérico | Color as restraint + identidad propia |
| **Semánticos** | Verde (neto/éxito), rojo (descuentos/error), ámbar (aviso) — **solo significado** | Mantlr: color por significado |
| **Micro-estados** | 6 estados por elemento: default, hover, focus (ring 2px), active (`scale:0.97`), disabled, loading. Todos implementados | Mantlr + Linear |
| **Densidad** | Layout tool-like: secciones numeradas 01/02/03, labels 13px, headers compactos, columnas de datos alineadas | Linear: "dense but intuitive" |
| **Glass** | **Eliminado** (nav, panel, dialog). Solo borders 1px + inset hover, sin blur | Linear: profundidad con 1px borders |
| **Neto** | Card sólida, número en grande (display ~48px) con `num-pop` y tabular — el "instrumento" | Linear: tipografía como ancla |
| **Radio** | 6px estándar (inputs/botones/cards), 12px máximo (dialog/panel neto) | Linear: radius 4/6/12 |
| **Elevación** | Borders 1px + `background: brightness(1.15)` en hover. **Sin box-shadow difusa** | Linear |

### Prohibiciones (checklist anti-slop, en cada sprint de UI)

- ✕ Gradientes púrpura→azul, orbes, shimmer (eliminados ya en S12 — NO reintroducir)
- ✕ `box-shadow` difusa en cards
- ✕ **Fraunces/serif display** (eliminada — una sola familia sans + mono)
- ✕ **Glass/backdrop-blur** (eliminado — el "Instrument" es sólido)
- ✕ Inter/Roboto/Open Sans como primaria
- ✕ 3 cards idénticas en grid
- ✕ >3 acentos compitiendo (uno solo: SV Blue + semánticos de significado)
- ✕ Emoji como iconos
- ✕ "Seamlessly/Unleash/Transform" en micro-copy (copy específica, con números)

---

## 4. OpenSpec freeze (lo que cambia en la verdad congelada)

### Deltas en `openspec/specs/`

- **ADDED** `openspec/specs/diseno-visual.md` — spec del design system "Linear Instrument":
  tokens light/dark (contraste verificado), escala tipográfica (Onest + JetBrains Mono),
  micro-estados, radius, elevación, prohibiciones. Es la "fuente visual" (ref: `DESIGN.md`).

### ADRs

- **ADDED** `.agents/adr/012-diseno-linear-instrument.md` — decisión: dark-first tool-like,
  una sola familia sans + mono, sin glass, acento SV Blue, micro-estados CSS puro.
  Referencia la investigación y la supera del plan anterior.
- **MODIFIED** `DESIGN.md` → se reescribe completo con los nuevos tokens (mantiene el rol de
  "fuente de verdad visual").

### Requisitos

- `specs/requirements.md`: sin cambios de RF (el diseño no cambia requisitos funcionales).
  Verificar que RF02 (jornada simplificada) sigue reflejado.

---

## 5. Sprints

> Regla sprint-workflow: **un sprint a la vez**, gate `pnpm lint && pnpm check-types && pnpm test`
> antes de declarar terminado, cierre documentado en `specs/sprints.md`.

| # | Sprint | Contenido | Salida verificable |
|---|---|---|---|
| 1 | **Freeze visual** | `openspec/specs/diseno-visual.md` (ADDED) + `ADR-012` + reescribir `DESIGN.md` + actualizar `index.html` (quitar Fraunces) | Docs congelados; gate verde (docs-only, sin cambios runtime) |
| 2 | **Tokens + base** | Reescribir `index.css`: dark-first tokens (SV Blue, neutros fríos), eliminar `.glass-*`/Fraunces/grain/map, radius 6px, `.amount` mono, focus rings, `scale:0.97` utility, `prefers-reduced-motion` | Gate + screenshot baseline dark |
| 3 | **Layout instrumento** | `App.tsx`: layout denso tool-like, secciones numeradas, header sólido (sin glass), col derecha de resumen con jerarquía de instrumento; componentes restilizados (inputs, buttons, cards) | Gate + screenshots light/dark |
| 4 | **Micro-estados** | Sweep de 6 estados en botones/inputs/selects (hover, focus, active `scale:0.97`, disabled, loading); `NetoLiquido` como panel instrumento con número grande; touch ≥44px móvil | Gate + checklist anti-slop sobre screenshots |
| 5 | **Cierre** | Print sólido, contraste AA verificado en ambos modos, auditoría anti-slop (rubric 30pts Krirox), `sprints.md` documentado | Gate + rubric < 8 (fuerte) |

### Qué NO va en estos sprints

- No deps nuevas (Radix/shadcn/framer/lucide siguen fuera).
- No re-tocar dominio (sprint-workflow: no mezclar diseño con lógica).
- No cambiar `tasas.ts` ni fórmulas.

---

## 6. Verificación (no negociable)

Cada sprint/PR:

```bash
pnpm lint && pnpm check-types && pnpm test
```

Además:
- [ ] `openspec/specs/diseno-visual.md` describe el CSS que acaba de aterrizar.
- [ ] `DESIGN.md` y `index.css` usan los mismos tokens (sin drift).
- [ ] Ningún componente usa clase `.glass-*`, `font-display` (Fraunces) o `bg-grain/map`.
- [ ] Todo elemento interactivo tiene 6 micro-estados (verificar en DOM: hover/focus/active).
- [ ] Contraste AA en light y dark (calculado, no asumido).
- [ ] Screenshots dark + light pasan rubric anti-slop (Krirox 30pts) < 8.
- [ ] `prefers-reduced-motion` y print respetados.

---

## 7. Estado del repo al inicio

- Branch: `feat/rediseno-tactile-editorial` (desde `main @ 15a9bd5`), con Sprints 11a–15 ya ejecutados
  (dominio + sin Clerk + tactile editorial actual).
- El trabajo pendiente **reemplaza** la estética S12–S15; el código de dominio (S11a/11b) se conserva.
- WIP `feat/modern-frontend-2026 @ 602e93b`: sigue deprecado, no se toca.

---

## 8. Ejecución (2026-08-30) — completada

| Sprint | Estado | Resumen |
|---|---|---|
| 1 | ✅ | Freeze visual: `diseno-visual.md` (ADDED) + ADR-012 + `DESIGN.md` + `index.html` sin Fraunces |
| 2 | ✅ | `index.css` reescrito (dark-first, sin glass/grain/map, radius 6px, `.amount`, `scale:0.97`) |
| 3 | ✅ | Layout instrumento: secciones 01–05, header `tool-header` sólido, badge SV |
| 4 | ✅ | `glass-* → tool-*` (sed 16 archivos), radios 6px, `NetoLiquido` panel-instrumento `text-5xl` |
| 5 | ✅ | Screenshots dark/light/mobile, auditoría anti-slop (0 tells), fix bug light-mode, `sprints.md` |

**Screenshots**: `/tmp/linear-dark.png`, `/tmp/linear-light.png`, `/tmp/linear-mobile.png`.

**Desviaciones documentadas:**
- `useTheme` default → `'dark'` (dark-first por JS, no por CSS class default).
- El light mode se activa con clase `.dark` ausente (`:root` = light tokens).