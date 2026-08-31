# DESIGN.md — Design System "Liquid Glass SV" (Independencia)

> Fuente de verdad visual del frontend. Verdad congelada en `openspec/specs/diseno-liquid-glass-sv.md`.
> Cada componente DEBE tomar colores, tipografía, espaciado, radio y micro-estados de aquí;
> no inventar valores. **Supercede** a "Linear Instrument" (ADR-012, 2026-08-30).

## Principios

1. **Liquid glass con criterio**: glass (`backdrop-filter blur`) en nav, panel del neto,
   modales y overlays — no en inputs ni contenido denso (WCAG AA). Fallback sólido si no
   hay `backdrop-filter`.
2. **Identidad SV, no kitsch**: azul bandera `#003B6F` (light) / `#7AB2E0` (dark) como
   acento. Dorado `#C8A951` solo decorativo. Fondo crema `#F7F5F1` (light) / navy `#0B192C`.
3. **Tipografía con voz**: Onest (UI) + JetBrains Mono (montos, `tabular-nums`) + Fraunces
   (serif display, solo título de marca + H1 de resultado). Serif + mono = sello editorial.
4. **Grain texture**: SVG noise inline para que el glass se sienta vítreo (evita banding).
   Respetado por `prefers-reduced-motion`.
5. **Elementos SV vivos**: Torogoz (SVG animado en header), Monumento al Divino Salvador
   del Mundo (contorno con trazo animado), dona circular glass en el panel del neto.
6. **Micro-interacciones con propósito**: `num-pop` al recalcular, `scale(0.97)` en active,
   hover glass sutil. `prefers-reduced-motion` las reduce a 0.01ms.
7. **Accesibilidad es piso**: WCAG AA light/dark verificado, focus rings 2px, touch ≥ 44px,
   `prefers-reduced-transparency` → glass sólido.

## Color tokens

### Light

| Token | Valor | Contraste AA |
|---|---|---|
| `--bg` | `#F7F5F1` | — |
| `--surface` | `#FFFFFF` | — |
| `--glass` | `rgba(255,255,255,0.65)` | — |
| `--glass-border` | `rgba(255,255,255,0.85)` | — |
| `--surface-raised` | `#FAF8F4` | — |
| `--surface-2` | `#EDE9E1` | — |
| `--border` | `#D8D2C7` | — |
| `--border-soft` | `#E4DFD5` | — |
| `--text` | `#141310` | 16.2:1 ✓ |
| `--text-secondary` | `#5C574E` | 6.8:1 ✓ |
| `--text-muted` | `#8A857C` | 4.7:1 ✓ |
| `--accent` | `#003B6F` | 10.4:1 ✓ |
| `--accent-hover` | `#002A52` | 12.8:1 ✓ |
| `--gold` | `#C8A951` | decorativo |
| `--success` | `#1B7A3D` | 5.4:1 ✓ |
| `--danger` | `#B3261E` | 6.1:1 ✓ |
| `--warning` | `#B5651D` | 5.0:1 ✓ |

### Dark (OLED — true black)

| Token | Valor | Contraste AA |
|---|---|---|
| `--bg` | `#000000` | — |
| `--surface` | `#0D0F13` | — |
| `--glass` | `rgba(16,18,24,0.55)` | — |
| `--glass-border` | `rgba(255,255,255,0.14)` | — |
| `--surface-raised` | `#14161B` | — |
| `--surface-2` | `#191C22` | — |
| `--border` | `#262A33` | — |
| `--border-soft` | `#1E2129` | — |
| `--text` | `#F2F4F6` | >20:1 ✓ |
| `--text-secondary` | `#C3C9D2` | >12:1 ✓ |
| `--text-muted` | `#8A919C` | >6:1 ✓ |
| `--accent` | `#7AB2E0` | >10:1 ✓ |
| `--accent-hover` | `#9BC4EC` | ✓ |
| `--gold` | `#D9B860` | decorativo |
| `--success` | `#4ADE80` | >9:1 ✓ |
| `--danger` | `#F87171` | >6:1 ✓ |
| `--warning` | `#FBBF24` | >8:1 ✓ |

### Vars de material glass

| Var | Light | Dark |
|---|---|---|
| `--rim-top` | `rgba(255,255,255,0.6)` | `rgba(255,255,255,0.4)` |
| `--rim-bottom` | `rgba(255,255,255,0.3)` | `rgba(255,255,255,0.18)` |
| `--rim-side` | `rgba(255,255,255,0.18)` | `rgba(255,255,255,0.1)` |
| `--sheen-opacity` | `0.5` | `0.35` |

**Aurora backdrop**: gradientes radiales estáticos en `body` (azul bandera, dorado,
turquesa). Requisito del glass — sin color detrás, el blur no muestra nada.

## Tipografía

| Rol | Familia | Uso |
|---|---|---|
| UI | **Onest** (400–700) | labels, párrafos, botones |
| Display | **Fraunces** (serif, 400–600) | **solo** título de marca + H1 "Resultado del Periodo" |
| Datos | **JetBrains Mono** (400–600) + `tabular-nums` | **todos los montos $** |

Escala: 11 / 12 / 13 / 14 / 16 / 18 / 24 / 32 / 48. Headings `letter-spacing: -0.02em`.

## Liquid glass — dónde y cómo

Receta Apple (fuentes: webtricks.dev, html-in-canvas.dev): `backdrop-filter: blur(14–20px)
saturate(170–180%) brightness(1.04+)` + **rim refractivo en 4 bordes** (inset shadows vía
`--rim-top/--rim-bottom/--rim-side`) + **sheen diagonal 135°** en `::after` con
`mix-blend-mode: screen` + **aurora de color detrás**. El elemento glass lleva
`position: relative; isolation: isolate`.

| Clase | Dónde | Blur |
|---|---|---|
| `.glass-nav` | header sticky | 16px saturate(180%) |
| `.glass-panel` | panel del neto | 20px saturate(180%) |
| `.glass-card` | cards sobre aurora | 14px saturate(170%) |
| `.glass-dialog` | modales (futuro) | 24px saturate(180%) |
| `.tool-card` | contenido denso, tablas | **sólido** `bg: var(--surface)` |
| `.tool-input` | inputs/selects | **sólido** (accesible) |

Fallback `@supports not (backdrop-filter)` → sólido + sin sheen.
`prefers-reduced-transparency` → sólido + sin sheen + sin aurora.

## Espaciado, radio y elevación

- **Espaciado**: base 4px (0/4/8/12/16/20/24/32/48).
- **Radio**: 12px en cards/inputs, 16px en `.glass-panel`, `rounded-full` en dona del neto.
- **Elevación**: borders 1px; `inset 0 1px 0` luz interior en glass; sin sombra difusa externa
  salvo el panel del neto (`0 8px 32px` muy baja opacidad).

## Micro-estados (checklist por elemento interactivo)

| Estado | Implementación |
|---|---|
| default | `surface` + `border 1px` (sólido) o `glass` (glass) |
| hover | glass: `brightness(1.06)` + borde dorado sutil; inputs: `border-color: var(--text-muted)` |
| focus | `border-color: var(--accent)` + `box-shadow: 0 0 0 2px var(--accent-soft)` |
| active | `transform: scale(0.97)` |
| disabled | `opacity: 0.5`, `cursor: not-allowed` |
| loading | `opacity: 0.7` + `aria-busy` |

## Elementos SV

- **Torogoz**: SVG inline en header, `translateY` ±2px 4s ease-in-out infinite (pausable).
- **Monumento al Salvador del Mundo**: SVG contorno, `stroke-dashoffset` 100%→0 2s una vez.
- **Dona del neto**: panel circular glass con monto al centro (guiño a Recharts donut).
- **Dorado**: separador de sección (línea 1px `--gold` 30% opacidad) — detalle, no bandera.

## Prohibiciones (anti-slop)

- ✕ Gradiente púrpura→azul / orbes / shimmer en botones
- ✕ `box-shadow` difusa externa en cards (solo luz interior en glass)
- ✕ Inter/Roboto/Open Sans como primaria
- ✕ >3 colores compitiendo (azul SV + dorado decorativo + semánticos)
- ✕ Emoji como iconos (SVG inline: Torogoz, Monumento, glifos custom)
- ✕ Glass en inputs o texto denso (WCAG)
- ✕ Kitsch patriótico: banderas gigantes, escudos oficiales, fuegos artificiales
- ✕ Copy genérica ("Seamlessly", "Unleash") — micro-copy específica con números
- ✕ Animaciones infinitas agresivas (solo `translateY` 2px del Torogoz, reducible)
