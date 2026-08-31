# Spec: Diseño Visual "Linear Instrument" (SV Blue)

> Verdad congelada del design system del frontend. Implementada en `apps/web/src/index.css`
> y documentada en `apps/web/DESIGN.md`. Si el CSS discrepa de esta spec, se corrige el CSS o
> se documenta la desviación. Supercede a la estética "Tactile Editorial" (2026-08-30).

## Principios

1. **Dark-first, tool-like**: la app es un instrumento de cálculo, no una landing page. Densidad
   de datos, no "aire editorial".
2. **Una sola tipografía sans + mono**: Onest (UI) + JetBrains Mono (datos/montos, tabular-nums).
   Sin serif display.
3. **Color por significado, no decoración**: escala de neutros + un solo acento (SV Blue).
   Verde/rojo/ámbar solo para neto/descuento/aviso.
4. **Craft sobre decoración**: 6 micro-estados por elemento (default, hover, focus, active,
   disabled, loading). `scale(0.97)` en active.
5. **Profundidad con borders, no blur**: sin `backdrop-filter`, sin glass, sin box-shadow difusa.
   Hover = `brightness(1.15)` + border-color.
6. **Accesibilidad es piso**: WCAG AA en light y dark, `prefers-reduced-motion`,
   focus rings diseñados (2px + offset), touch ≥ 44px en móvil.

## Tokens (light/dark)

### Light

| Token | Valor | Uso | Contraste AA |
|---|---|---|---|
| `--bg` | `#F5F6F7` | fondo página (neutral frío) | — |
| `--surface` | `#FFFFFF` | cards, inputs | — |
| `--surface-raised` | `#F8F9FA` | hover/raised | — |
| `--surface-2` | `#EBEDEF` | alt/inset | — |
| `--border` | `#D5D9DE` | hairline | — |
| `--border-soft` | `#E2E6EA` | divisiones sutiles | — |
| `--text` | `#1A1D21` | principal | 16.5:1 ✓ |
| `--text-secondary` | `#5B6472` | secundario | 6.2:1 ✓ |
| `--text-muted` | `#7C8694` | metadatos | 4.6:1 ✓ |
| `--accent` | `#1D4ED8` | links, foco, primario | 7.1:1 ✓ |
| `--accent-hover` | `#1E40AF` | hover | ✓ |
| `--accent-soft` | `rgba(29,78,216,0.10)` | foco/fondos suaves | — |
| `--success` | `#15803D` | neto / dinero | 4.9:1 ✓ |
| `--danger` | `#B91C1C` | descuentos / errores | 6.9:1 ✓ |
| `--warning` | `#B45309` | avisos | 5.3:1 ✓ |
| `--selection` | `rgba(29,78,216,0.18)` | selección | — |

### Dark

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0C0D0F` | fondo (near-black) |
| `--surface` | `#141517` | cards |
| `--surface-raised` | `#1A1B1E` | hover/raised |
| `--surface-2` | `#1E2023` | alt/inset |
| `--border` | `#26282D` | hairline |
| `--border-soft` | `#2E3137` | divisiones sutiles |
| `--text` | `#F2F4F6` | principal (17.9:1 ✓) |
| `--text-secondary` | `#C3C9D2` | (9.6:1 ✓) |
| `--text-muted` | `#8A919C` | (5.5:1 ✓) |
| `--accent` | `#60A5FA` | (7.6:1 ✓) |
| `--accent-hover` | `#7FB4FA` | ✓ |
| `--accent-soft` | `rgba(96,165,250,0.14)` | foco/fondos suaves |
| `--success` | `#4ADE80` | (9.3:1 ✓) |
| `--danger` | `#F87171` | (6.7:1 ✓) |
| `--warning` | `#FBBF24` | (8.9:1 ✓) |
| `--selection` | `rgba(96,165,250,0.28)` | — |

## Tipografía

| Rol | Familia | Uso |
|---|---|---|
| UI | **Onest** (sans variable, 400–700) | todo el texto (labels, párrafos, botones) |
| Datos | **JetBrains Mono** (400–600) + `font-variant-numeric: tabular-nums` | **todos los montos $** y números de datos |

Escala: 11 / 12 / 13 / 14 / 16 / 18 / 24 / 32 / 48. Headings: `letter-spacing: -0.02em`,
`line-height` 1.1–1.25. Labels 13px. Cuerpo 14–16px.

## Espaciado y radio

- **Espaciado**: base 4px — 0, 4, 8, 12, 16, 20, 24, 32, 48.
- **Radio**: 6px estándar (cards, inputs, botones, selects), 12px máximo (panel del neto).
  **Sin** `rounded-full`/`rounded-2xl`/`rounded-xl` en cards o inputs.
- **Elevación**: borders 1px. **Sin `box-shadow` difusa** excepto el panel del neto
  (`0 1px 0 0` hairline) y el focus ring (2px `--accent`).

## Micro-estados (craft — checklist por elemento interactivo)

Todo input, select, botón y elemento clickable tiene:

| Estado | Implementación |
|---|---|
| default | `background: var(--surface)`, `border: 1px solid var(--border)` |
| hover | `border-color: var(--text-muted)` (inputs) / `background: var(--surface-raised)` (cards, botones) |
| focus (keyboard) | `border-color: var(--accent)` + `box-shadow: 0 0 0 2px var(--accent-soft)` |
| active (pressed) | `transform: scale(0.97)` |
| disabled | `opacity: 0.5`, `cursor: not-allowed`, sin transform |
| loading | `opacity: 0.7` + indicador (spinner `aria-busy`) |

`prefers-reduced-motion`: `scale` y transiciones → 0.01ms.

## Prohibiciones (checklist anti-slop)

- ✕ Gradientes púrpura→azul / orbes / shimmer en botones
- ✕ `box-shadow` difusa en cards
- ✕ Serif display (Fraunces) — **una** sola familia sans + mono
- ✕ `backdrop-filter` / glass / blur (solo borders + brightness)
- ✕ Inter/Roboto/Open Sans como primaria
- ✕ 3 cards idénticas en grid
- ✕ >1 acento compitiendo (solo SV Blue + semánticos de significado)
- ✕ Emoji como iconos
- ✕ Copy genérica ("Seamlessly", "Unleash") — micro-copy específica con números

## ADRs relacionados

- `ADR-012` (diseño Linear Instrument, dark-first, sin glass)
- `ADR-011` (sin autenticación)