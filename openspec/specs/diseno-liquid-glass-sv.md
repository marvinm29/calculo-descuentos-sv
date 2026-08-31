# Spec: Diseño Visual "Liquid Glass SV" (Independencia)

> Verdad congelada del design system del frontend. Implementada en `apps/web/src/index.css`
> y documentada en `apps/web/DESIGN.md`. Si el CSS discrepa de esta spec, se corrige el CSS
> o se documenta la desviación. **Supercede** a "Linear Instrument" (2026-08-30, ADR-012).

## Contexto

El usuario descartó "Linear Instrument" (Sprints 11a–15 + Linear) por *"no me gustó el diseño
del último commit"*. La nueva dirección es **"Liquid Glass + Independencia SV"**:
glassmorphism moderna con criterio + identidad patriótica salvadoreña (septiembre, mes de
independencia). La estética "Tactile Editorial" y "Linear Instrument" quedan como referencia
de proceso, no de código a copiar.

## Principios

1. **Liquid glass con criterio**: glass (`backdrop-filter blur`) en **nav, panel del neto,
   modales/diálogos** y overlays — no en contenido denso ni inputs (accesibilidad WCAG AA).
   Contraste garantizado sobre glass (fondo semi-opaco nunca por debajo de 8px blur).
2. **Identidad SV, no kitsch**: azul bandera `#003B6F` (light) / `#7AB2E0` (dark) como
   acento. Dorado `#C8A951` solo como detalle decorativo (separador, firma), nunca funcional.
   Fondo cálido crema `#F7F5F1` (light) / navy profundo `#0B192C` (dark).
3. **Tipografía con voz**: Onest (UI) + JetBrains Mono (montos, `tabular-nums`) + **Fraunces**
   (serif display, solo título principal del header y H1 de resultado). Serif + mono = sello
   editorial, no SaaS genérico.
4. **Grain texture**: SVG noise inline como `background-image` para que el glass tenga
   textura real (evita banding en degradados translúcidos). Respetado por
   `prefers-reduced-motion` (sin animación de grain).
5. **Elementos SV vivos**: Torogoz (pájaro nacional) como SVG animado en el header
   (vuelo sutil, `prefers-reduced-motion` lo pausa). Monumento al Divino Salvador del Mundo
   como contorno SVG con animación de trazo (`stroke-dashoffset`). Iconografía "2x1 donas"
   (donut dual) en secciones de cálculo — guiño a la dona de Recharts ya existente.
6. **Micro-interacciones con propósito**: `num-pop` al recalcular (ya existe), hover glass
   sutil, `scale(0.97)` en active. `prefers-reduced-motion` las reduce a 0.01ms.
7. **Accesibilidad es piso**: WCAG AA en light y dark verificado (no asumido). Focus rings
   2px + offset. Touch ≥ 44px en móvil. `prefers-reduced-transparency` → glass sólido.

## Tokens (light/dark)

### Light

| Token | Valor | Uso | Contraste AA |
|---|---|---|---|
| `--bg` | `#F7F5F1` | fondo página (crema cálida) | — |
| `--bg-grain` | `#EFEBE3` | tinte del grain | — |
| `--surface` | `#FFFFFF` | cards sólidas | — |
| `--glass` | `rgba(255, 255, 255, 0.65)` | glass (nav, panel neto) | — |
| `--glass-border` | `rgba(255, 255, 255, 0.85)` | borde glass (luz interior) | — |
| `--surface-raised` | `#FAF8F4` | hover/raised | — |
| `--surface-2` | `#EDE9E1` | alt/inset | — |
| `--border` | `#D8D2C7` | hairline cálido | — |
| `--border-soft` | `#E4DFD5` | divisiones sutiles | — |
| `--text` | `#141310` | principal | 16.2:1 ✓ |
| `--text-secondary` | `#5C574E` | secundario | 6.8:1 ✓ |
| `--text-muted` | `#8A857C` | metadatos | 4.7:1 ✓ |
| `--accent` | `#003B6F` | azul bandera SV (links, foco) | 10.4:1 ✓ |
| `--accent-hover` | `#002A52` | hover | 12.8:1 ✓ |
| `--accent-soft` | `rgba(0, 59, 111, 0.10)` | foco/fondos suaves | — |
| `--gold` | `#C8A951` | dorado independencia (decorativo) | 3.1:1 (solo decorativo) |
| `--success` | `#1B7A3D` | neto / dinero | 5.4:1 ✓ |
| `--danger` | `#B3261E` | descuentos / errores | 6.1:1 ✓ |
| `--warning` | `#B5651D` | avisos | 5.0:1 ✓ |
| `--selection` | `rgba(0, 59, 111, 0.18)` | selección | — |

### Dark

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0B192C` | fondo (navy profundo, "noche cívica") |
| `--bg-grain` | `#0A1622` | tinte del grain |
| `--surface` | `#13253C` | cards sólidas |
| `--glass` | `rgba(20, 40, 66, 0.55)` | glass (nav, panel neto) |
| `--glass-border` | `rgba(122, 178, 224, 0.25)` | borde glass (luz azul) |
| `--surface-raised` | `#172B45` | hover/raised |
| `--surface-2` | `#1C3149` | alt/inset |
| `--border` | `#2A4060` | hairline |
| `--border-soft` | `#233A55` | divisiones sutiles |
| `--text` | `#F2F4F6` | principal (17.5:1 ✓) |
| `--text-secondary` | `#C3C9D2` | (9.6:1 ✓) |
| `--text-muted` | `#8A919C` | (5.5:1 ✓) |
| `--accent` | `#7AB2E0` | azul bandera (10.2:1 ✓) |
| `--accent-hover` | `#9BC4EC` | hover (11.8:1 ✓) |
| `--accent-soft` | `rgba(122, 178, 224, 0.14)` | foco/fondos suaves |
| `--gold` | `#D9B860` | dorado decorativo |
| `--success` | `#4ADE80` | (9.3:1 ✓) |
| `--danger` | `#F87171` | (6.7:1 ✓) |
| `--warning` | `#FBBF24` | (8.9:1 ✓) |
| `--selection` | `rgba(122, 178, 224, 0.28)` | — |

## Tipografía

| Rol | Familia | Uso |
|---|---|---|
| UI | **Onest** (sans variable, 400–700) | labels, párrafos, botones |
| Display | **Fraunces** (serif, 400–600) | **solo** título del header + H1 "Resultado del Periodo" |
| Datos | **JetBrains Mono** (400–600) + `tabular-nums` | **todos los montos $** y números de datos |

Escala: 11 / 12 / 13 / 14 / 16 / 18 / 24 / 32 / 48. Headings `letter-spacing: -0.02em`.
Labels 13px. Cuerpo 14–16px. Display (Fraunces) solo en el título de marca.

## Liquid glass — reglas

1. **Dónde**: `.glass-nav` (header sticky), `.glass-panel` (panel del neto), `.glass-dialog`
   (modales), `.glass-card` (cards de resultado cuando hay fondo de textura detrás).
2. **Dónde NO**: inputs, selects, contenido de texto denso, tablas de tasas. Sobre fondo
   sólido sin textura el glass se ve muerto — usar `.tool-card` sólido en su lugar.
3. **Fórmula**: `background: var(--glass)`, `backdrop-filter: blur(12px) saturate(1.4)`,
   `border: 1px solid var(--glass-border)`, `box-shadow: inset 0 1px 0 rgba(255,255,255,0.4)`
   (luz interior) — sin sombra difusa externa (anti-slop).
4. **Fallback**: `@supports not (backdrop-filter: blur(1px))` → `background: var(--surface)`.
5. **Reduced transparency**: `@media (prefers-reduced-transparency: reduce)` →
   `background: var(--surface)`, sin `backdrop-filter`.

## Grain texture

SVG noise inline (8x8 o 16x16, `data:image/svg+xml`) como `background-image` en `body` o en
`.glass-*` para dar textura. Opacidad baja (`opacity: 0.04`). Sin animación
(`prefers-reduced-motion`). Elimina banding en degradados y hace que el glass se sienta
"vítreo" en lugar de plano muerto.

## Elementos SV (patrióticos, no kitsch)

- **Torogoz** (Pájaro Nacional, *Eumomota superciliosa*): SVG inline en header, animación
  de vuelo sutil (`translateY` ±2px, 4s ease-in-out infinite). `prefers-reduced-motion` →
  estático. Colores: azul bandera + dorado (cola) — tonos del plumaje real.
- **Monumento al Divino Salvador del Mundo**: SVG contorno (line art) como separador
  decorativo en footer o transición entre secciones. Animación de trazo
  (`stroke-dashoffset` de 100% a 0, 2s, una vez al entrar viewport vía
  `@starting-style` o `IntersectionObserver` en CSS puro). No animado en reduced-motion.
- **Iconos "2x1 donas"**: los donuts de Recharts (`GraficoPastel`) ya son donas. Se
  estiliza el panel del neto como una "dona" circular glass con el monto al centro.
  Iconos de secciones (lucide-equivalentes SVG inline) con estilo dona (círculo +
  glifo central).
- **Paleta independencia**: solo en septiembre (este sprint) se añade un sutil acento
  dorado `--gold` en separadores y firma. El resto del año el dorado se omite (se puede
  dejar como token pero sin usarlo funcionalmente).

## Espaciado, radio y elevación

- **Espaciado**: base 4px — 0, 4, 8, 12, 16, 20, 24, 32, 48.
- **Radio**: 12px en cards/inputs (más orgánico que 6px del Linear), 16px en glass-panel
  del neto, `rounded-full` solo en la dona del neto y avatar Torogoz.
- **Elevación**: borders 1px en cards sólidas; `inset 0 1px 0` luz interior en glass;
  sin `box-shadow` difusa externa salvo el panel del neto (`0 8px 32px` muy baja opacidad).

## Micro-estados (craft — checklist por elemento interactivo)

| Estado | Implementación |
|---|---|
| default | `background: var(--surface)`, `border: 1px solid var(--border)` |
| hover | glass cards: `brightness(1.06)` + borde dorado sutil; inputs: `border-color: var(--text-muted)` |
| focus (keyboard) | `border-color: var(--accent)` + `box-shadow: 0 0 0 2px var(--accent-soft)` |
| active (pressed) | `transform: scale(0.97)` |
| disabled | `opacity: 0.5`, `cursor: not-allowed` |
| loading | `opacity: 0.7` + `aria-busy` |

`prefers-reduced-motion`: `scale` y transiciones → 0.01ms.

## Prohibiciones (checklist anti-slop)

- ✕ Gradiente púrpura→azul (el WIP lo tenía) — **eliminado**
- ✕ `box-shadow` difusa externa en cards (solo luz interior en glass + hairline neto)
- ✕ Inter/Roboto/Open Sans como primaria (usar Onest + Fraunces + JetBrains Mono)
- ✕ >3 colores compitiendo (azul SV + dorado decorativo + semánticos neto/descuento/aviso)
- ✕ Emoji como iconos (SVG inline: Torogoz, Monumento, glifos custom)
- ✕ Glass en inputs o texto denso (rompe contraste, WCAG)
- ✕ Kitsch patriótico: banderas gigantes, escudos oficiales, fuegos artificiales.
  Identidad SV sutil — colores + iconos de fauna/monumento, no bandera literal.
- ✕ Copy genérica ("Seamlessly", "Unleash") — micro-copy específica con números
- ✕ Animaciones infinitas agresivas (solo `translateY` 2px del Torogoz, 4s, reducible)

## ADRs relacionados

- `ADR-013` (diseño Liquid Glass SV Independencia — supercede ADR-012)
- `ADR-011` (sin autenticación — sigue vigente)
- `ADR-006` (offline-first — sigue vigente)
- `ADR-001` (lógica única en shared — sigue vigente)
