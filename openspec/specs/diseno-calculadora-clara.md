# Spec: Diseño “Calculadora clara y calmada”

**Estado**: vigente desde 2026-09-20. Reemplaza la estética Liquid Glass SV (ADR-013) y
mantiene las restricciones funcionales de `integridad-calculo.md`.

## Objetivo

Permitir que una persona calcule su liquidación con confianza, sin tener que interpretar una
interfaz ornamental. La jerarquía debe explicar qué introducir, qué se validó y qué resultado se
obtuvo antes de mostrar detalles secundarios.

## Principios verificables

1. **Contenido primero**: superficies opacas, bordes y separación; no `backdrop-filter`, blur,
   aurora, grain, sheen ni transparencia decorativa.
2. **Una tarea por sección**: configuración, horas, incentivos y resultado tienen encabezado,
   descripción breve y acción primaria clara.
3. **Resultado visible**: en móvil el resumen aparece antes de la información secundaria; en
   escritorio permanece visible sin ocultar el formulario.
4. **Divulgación progresiva**: tasas, fórmula, prestaciones e historial se abren bajo demanda y
   no compiten con el cálculo principal.
5. **Identidad sobria**: azul como acento funcional, neutros cálidos/fríos para superficies y
   semánticos solo para éxito, aviso y error. Ningún color decorativo adicional.
6. **Accesibilidad por diseño**: WCAG 2.2 AA como mínimo de aceptación; teclado, foco visible,
   etiquetas explícitas, `aria-describedby` para errores, contraste, zoom 200 %, reduced motion y
   forced colors.
7. **Evidencia sobre moda**: ninguna tendencia visual se adopta sin una hipótesis, prueba de
   usabilidad o evidencia de accesibilidad/performance.

## Tokens y estados

La implementación vive en `apps/web/src/index.css` y debe exponer únicamente tokens usados por
`@theme`: `bg`, `surface`, `surface-raised`, `surface-alt`, `border`, `border-soft`, `text`,
`text-secondary`, `text-muted`, `primary`, `primary-hover`, `primary-soft`, `success`, `danger`,
`warning`; también `on-accent` (color del texto sobre superficies de acento:
blanco en tema claro, casi negro en tema oscuro, para cumplir contraste ≥ 4.5:1). Cada control
define default, hover, focus-visible, active, disabled
y loading. Ningún componente puede inventar un color o clase no declarada.

## Composición responsive

- Móvil: encabezado → resumen de resultado → configuración → horas → incentivos → detalles.
- Escritorio: formulario y resultado en dos columnas, con el resultado sticky solo cuando no
  oculte foco ni teclado.
- **Orden DOM y foco (FE-08, 2026-09-20)**: el resultado precede a la captura **en el DOM**
  (no solo visualmente). Prohibido usar `order-*` de Tailwind para invertir columnas: el orden
  CSS engaña al ojo pero el orden de teclado y lector sigue el DOM. En escritorio la inversión
  visual se logra con colocación explícita de grid (`col-start`/`row-start`), manteniendo el
  formulario a la izquierda y el resultado a la derecha. El orden de foco es constante en ambos
  breakpoints (resultado → captura → detalles) y coincide con el orden de lectura móvil; no
  depende de CSS `order`. Prueba de regresión: orden DOM (posición relativa en el árbol) y
  navegación por teclado (primer elemento enfocable dentro de `<main>` pertenece al resultado).
- Ancho mínimo probado: 320 px; zoom 200 % sin pérdida de información o desplazamiento horizontal
  accidental.
- Objetivos táctiles y controles de icono: preferir 44×44 CSS px, nunca texto diminuto como única
  affordance.
- **Carga diferida de vistas secundarias (FE-12, 2026-09-27)**: el gráfico y el historial se cargan
  con `lazy`/`Suspense`; la Guía —dentro de un `<details>` cerrado— se monta **al abrirse**, de modo
  que no se descarga ni evalúa en el primer render y no suspende en paralelo con las otras vistas.
  Prueba de regresión: `App.test.tsx` renderiza con `success` sin suspender ni colgar `act`.

## Anuncios, gráficos y estados dinámicos

- **Anuncio del resultado (FE-18)**: el importe neto no puede usar `role="status"` que se
  actualice en cada pulsación de tecla. El anuncio se hace con `aria-live="polite"` solo cuando
  el valor se estabiliza (debounce) o tras una acción explícita del usuario; la cifra visible
  siempre refleja el cálculo inmediato.
- **Gráfico con alternativa textual (FE-07)**: cualquier gráfico (p. ej. pastel/dona) expone una
  alternativa tabular o de lista con los mismos importes, accesible por lector de pantalla,
  teclado, impresión y sin transparencia. El SVG del gráfico se marca **decorativo**
  (`aria-hidden`) porque los sectores no tienen nombre accesible y la tabla es la representación
  real: `role="img"` sin equivalente textual no es aceptable, y `role="img"` con hijos sin nombre
  tampoco (falla `svg-img-alt`). Los colores del gráfico provienen de tokens, no de valores hex
  hardcodeados.
- **Errores de fila (FE-06)**: cada error tiene ID estable, `aria-invalid` solo en el/los campos
  causantes y `aria-describedby` hacia el mensaje; el primer error de un envío recibe el foco.
  En los formularios con envío explícito (p. ej. `ConfigInicial`), un submit con errores enfoca
  el primer campo inválido (`ref` + `focus()`, mismo orden que el render) y prueba RTL verifica
  `document.activeElement`. En capturas sin envío (horas e incentivos), el error se anuncia con
  `role="alert"` sin robar el foco mientras la persona escribe.

## Prohibiciones

No añadir `.glass-*`, `backdrop-filter`, `-webkit-backdrop-filter`, fondos aurora, noise/grain,
sheen, gradientes ornamentales ni clases Tailwind sin token. Liquid Glass y Linear Instrument se
conservan solamente como historial de decisiones.

## Criterios de aceptación

- `rg` no encuentra las técnicas prohibidas en el código vigente de `apps/web`.
- Axe/WCAG no reporta violaciones críticas o serias en los flujos principales.
- Todas las tasas/formulas se obtienen de `@calc/shared`; las tablas muestran fecha y fuente.
- La suite cubre flujo feliz, errores, límites, localStorage corrupto, móvil, teclado, impresión
  y dark/light.
- El bundle inicial y las métricas LCP/INP/CLS cumplen el presupuesto acordado en el plan de
  calidad.

## Fuentes y relación con normas

- ISO 9241-210:2019 para diseño centrado en las personas.
- ISO/IEC 25010:2023 para atributos de calidad.
- WCAG 2.2 y tutoriales W3C para formularios y notificación de errores.
- La justificación, riesgos y pruebas están en `docs/plan-frontend-calidad-sdd.md`.
