# DESIGN.md — Design System "Linear Instrument" (SV Blue)

> Fuente de verdad visual del frontend. Verdad congelada en `openspec/specs/diseno-visual.md`.
> Cada componente DEBE tomar colores, tipografía, espaciado, radio y micro-estados de aquí;
> no inventar valores. Supercede al "Tactile Editorial" (2026-08-30).

## Principios

1. **Dark-first, tool-like**: instrumento de cálculo, no landing page. Densidad de datos,
   secciones numeradas, headers compactos.
2. **Una sola tipografía sans + mono**: Onest (UI) + JetBrains Mono (montos, tabular-nums).
   Sin serif display.
3. **Color por significado**: neutros + un acento SV Blue. Verde/rojo/ámbar solo neto/descuento/aviso.
4. **Craft sobre decoración**: 6 micro-estados por elemento; `scale(0.97)` en active.
5. **Profundidad con borders, no blur**: sin glass, sin box-shadow difusa. Hover =
   `brightness(1.15)` + border-color.
6. **Accesibilidad es piso**: WCAG AA light/dark, `prefers-reduced-motion`, focus rings, touch ≥ 44px.

## Color tokens

### Light

| Token | Valor | Contraste AA |
|---|---|---|
| `--bg` | `#F5F6F7` | — |
| `--surface` | `#FFFFFF` | — |
| `--surface-raised` | `#F8F9FA` | — |
| `--surface-2` | `#EBEDEF` | — |
| `--border` | `#D5D9DE` | — |
| `--border-soft` | `#E2E6EA` | — |
| `--text` | `#1A1D21` | 16.5:1 ✓ |
| `--text-secondary` | `#5B6472` | 6.2:1 ✓ |
| `--text-muted` | `#7C8694` | 4.6:1 ✓ |
| `--accent` | `#1D4ED8` | 7.1:1 ✓ |
| `--accent-hover` | `#1E40AF` | ✓ |
| `--success` | `#15803D` | 4.9:1 ✓ |
| `--danger` | `#B91C1C` | 6.9:1 ✓ |
| `--warning` | `#B45309` | 5.3:1 ✓ |

### Dark

| Token | Valor | Contraste AA |
|---|---|---|
| `--bg` | `#0C0D0F` | — |
| `--surface` | `#141517` | — |
| `--surface-raised` | `#1A1B1E` | — |
| `--surface-2` | `#1E2023` | — |
| `--border` | `#26282D` | — |
| `--border-soft` | `#2E3137` | — |
| `--text` | `#F2F4F6` | 17.9:1 ✓ |
| `--text-secondary` | `#C3C9D2` | 9.6:1 ✓ |
| `--text-muted` | `#8A919C` | 5.5:1 ✓ |
| `--accent` | `#60A5FA` | 7.6:1 ✓ |
| `--accent-hover` | `#7FB4FA` | ✓ |
| `--success` | `#4ADE80` | 9.3:1 ✓ |
| `--danger` | `#F87171` | 6.7:1 ✓ |
| `--warning` | `#FBBF24` | 8.9:1 ✓ |

## Tipografía

| Rol | Familia | Uso |
|---|---|---|
| UI | **Onest** (sans, 400–700) | todo el texto |
| Datos | **JetBrains Mono** (400–600) + `tabular-nums` | **todos los montos $** |

Escala: 11 / 12 / 13 / 14 / 16 / 18 / 24 / 32 / 48. Headings `letter-spacing: -0.02em`.
Labels 13px. Cuerpo 14–16px.

## Espaciado, radio y elevación

- **Espaciado**: base 4px (0/4/8/12/16/20/24/32/48).
- **Radio**: 6px estándar, 12px máximo (panel neto). Sin `rounded-full/2xl/xl` en cards/inputs.
- **Elevación**: borders 1px. Sin box-shadow difusa (salvo hairline del neto y focus ring).

## Micro-estados (checklist por elemento interactivo)

| Estado | Implementación |
|---|---|
| default | surface + border 1px |
| hover | border-color muted (inputs) / surface-raised (cards, botones) |
| focus (keyboard) | border accent + ring 2px accent-soft |
| active (pressed) | `transform: scale(0.97)` |
| disabled | `opacity: 0.5`, `cursor: not-allowed` |
| loading | `opacity: 0.7` + `aria-busy` |

## Prohibiciones (anti-slop)

- ✕ Gradientes púrpura→azul / orbes / shimmer
- ✕ box-shadow difusa en cards
- ✕ Serif display (Fraunces) — una familia sans + mono
- ✕ `backdrop-filter` / glass / blur
- ✕ Inter/Roboto/Open Sans como primaria
- ✕ 3 cards idénticas en grid
- ✕ >1 acento compitiendo
- ✕ Emoji como iconos
- ✕ Copy genérica ("Seamlessly", "Unleash") — específica con números