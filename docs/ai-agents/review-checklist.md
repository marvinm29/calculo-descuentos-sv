# Checklist de revisión para agentes

Marcar cada punto o escribir `N/A` con una razón. Un PR no está listo con casillas vacías.

## Especificación y alcance

- [ ] El problema y la causa raíz son reproducibles.
- [ ] La spec/ADR vigente define el comportamiento, no solo la implementación.
- [ ] Se enumeran no-alcance, riesgo y estrategia de rollback.
- [ ] Los cambios no reintroducen Clerk, SQLite, historial remoto ni recargo nocturno inferido.
- [ ] Existe trazabilidad requisito → código → prueba → evidencia.

## Frontend

- [ ] El flujo funciona en 320 px, teclado, zoom 200 % y orientación móvil.
- [ ] Cada control tiene etiqueta explícita, nombre accesible, estado y mensaje de error asociado.
- [ ] El foco es visible y no queda oculto; los objetivos táctiles son utilizables.
- [ ] No hay tokens Tailwind inexistentes ni clases de diseño duplicadas.
- [ ] La UI no usa Liquid Glass, `backdrop-filter`, blur decorativo ni datos legales duplicados.
- [ ] `prefers-reduced-motion`, alto contraste/forced colors, impresión y dark/light fueron revisados.

## Datos, seguridad y privacidad

- [ ] Toda entrada externa se valida con Zod o un parser equivalente antes de usarla.
- [ ] Números no finitos, fechas imposibles, límites y campos desconocidos tienen pruebas negativas.
- [ ] El historial corrupto se descarta sin romper la aplicación y avisa al usuario.
- [ ] No se registran salarios, incentivos ni fechas sensibles en logs o telemetría.
- [ ] `pnpm audit --prod --audit-level=low` y las pruebas de seguridad pasan.

## Verificación y entrega

- [ ] Tests unitarios, integración y E2E críticos pasan; hay prueba de regresión para cada bug.
- [ ] Axe/WCAG no reporta violaciones críticas o serias conocidas.
- [ ] Bundle, LCP, INP y CLS están dentro de los presupuestos acordados.
- [ ] `pnpm check` pasa sin caché engañosa y el resultado está anotado.
- [ ] README, CONTEXT, OpenSpec, ADR y CHANGELOG están sincronizados.
- [ ] Se documentan limitaciones y riesgos residuales, no solo el resultado feliz.
