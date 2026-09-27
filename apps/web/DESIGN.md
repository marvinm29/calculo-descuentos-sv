# DESIGN.md — Design System “Calculadora clara y calmada”

Fuente de verdad de implementación visual. La spec normativa está en
[`openspec/specs/diseno-calculadora-clara.md`](../../openspec/specs/diseno-calculadora-clara.md).
Las decisiones anteriores se conservan como historial en ADR-012 y ADR-013; no son guía de
código vigente.

## Principios

1. **Contenido primero**: superficies sólidas, borde visible y separación suficiente. No usar
   `backdrop-filter`, blur, transparencia, aurora, grain ni sheen.
2. **Calma y confianza**: un acento azul para acciones y enlaces; verde, ámbar y rojo solo para
   significado. El dorado es decorativo y nunca comunica un estado.
3. **Jerarquía de cálculo**: el resumen neto y los errores deben encontrarse antes que las tasas,
   la guía o el historial.
4. **Responsive real**: móvil desde 320 px, teclado y zoom 200 % son escenarios de primera clase.
5. **Estados completos**: cada control implementa default, hover, focus-visible, active,
   disabled y loading, además de reduced motion y forced colors.

## Tokens

Los tokens se declaran en `apps/web/src/index.css` dentro de `@theme`. Antes de añadir una clase,
comprobar que su token existe; no usar nombres como `bg-accent`, `bg-accent-soft` o
`text-primary-light` si no están declarados. La paleta debe conservar contraste WCAG 2.2 AA en
light y dark y no depender de una textura o transparencia para ser legible.

| Grupo      | Tokens                                               |
| ---------- | ---------------------------------------------------- |
| Superficie | `bg`, `surface`, `surface-raised`, `surface-alt`     |
| Texto      | `text`, `text-secondary`, `text-muted`               |
| Acción     | `primary`, `primary-hover`, `primary-soft`, `on-accent` |
| Estado     | `success`, `danger`, `warning`                       |
| Datos      | familia mono + `tabular-nums` para importes y cifras |

## Componentes y composición

- `panel`: agrupación de contenido con fondo `surface`, borde y radio moderado.
- `section-card`: una tarea (configuración, horas o incentivos) con encabezado y ayuda breve.
- `result-card`: neto, descuentos y periodo; no depende de un donut o de un efecto visual.
- `details`/acordeón: tasas, fórmula, prestaciones e historial bajo demanda.
- Inputs y selects: fondo sólido, etiqueta explícita, ayuda y error asociado mediante
  `aria-describedby`.

En móvil el orden esperado es encabezado → resumen → configuración → horas → incentivos →
detalles. En escritorio el resultado puede ser sticky únicamente si no tapa el foco ni introduce
scroll inesperado.

## Accesibilidad y movimiento

- WCAG 2.2 AA: contraste, foco visible, navegación completa con teclado, zoom 200 %, nombres y
  roles accesibles, `aria-invalid`/`aria-describedby` para errores y alternativa textual para
  gráficos.
- Preferir un área táctil de 44×44 CSS px para iconos y acciones compactas.
- `@media (prefers-reduced-motion: reduce)` elimina transformaciones y transiciones no esenciales.
- `@media (forced-colors: active)` conserva bordes, foco y estados con colores del sistema.
- Los montos siempre tienen texto, no solo color o gráfico.

## Revisión visual

Una revisión visual debe comprobar light/dark, 320 px/768 px/1280 px, error y resultado, foco de
teclado, impresión y un navegador sin efectos avanzados. Una captura aislada no constituye
evidencia de calidad; registrar también pruebas y métricas en el plan de calidad.

## Prohibiciones

No introducir `.glass-*`, Liquid Glass, `backdrop-filter`, `-webkit-backdrop-filter`, blur
decorativo, aurora, grain, sheen, gradientes ornamentales ni tokens inexistentes. Si una
dependencia o componente propone alguno, abrir un ADR antes de aceptarlo.
