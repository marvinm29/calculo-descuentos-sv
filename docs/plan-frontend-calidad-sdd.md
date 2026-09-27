# Plan SDD de corrección y actualización del frontend

**Corte de auditoría:** 2026-09-20 · **Estado:** aprobado como plan, implementación pendiente.

Este documento convierte la auditoría del frontend en trabajo ejecutable. No afirma certificación
ISO/IEEE ni conformidad legal: propone una adopción proporcionada, trazable y auditable de buenas
prácticas para una calculadora pública de nómina. La arquitectura vigente (API stateless,
offline-first, historial local, tasas en `@calc/shared`) se mantiene.

## 1. Criterio de calidad y fuentes

La selección combina normas de ciclo de vida, requisitos, calidad, V&V, testing, seguridad,
accesibilidad y conocimiento profesional:

| Referencia                                                                                                                                                                                                                                                                  | Aplicación en este proyecto                                                                                                 | Evidencia esperada                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [ISO/IEC/IEEE 12207:2026](https://www.iso.org/standard/90219.html)                                                                                                                                                                                                          | Ciclo de vida iterativo: requisito, diseño, implementación, operación y mejora                                              | SDD por cambio, revisión, release y rollback                  |
| [ISO/IEC/IEEE 29148:2018](https://www.iso.org/obp/ui?_escaped_fragment_=iso%3Astd%3Aiso-iec-ieee%3A29148%3Aed-2%3Av1%3Aen)                                                                                                                                                  | Requisitos completos, consistentes, verificables y trazables                                                                | OpenSpec + matriz requisito→test                              |
| [ISO/IEC 25010:2023](https://committee.iso.org/standard/78176.html)                                                                                                                                                                                                         | Calidad: adecuación funcional, eficiencia, compatibilidad, usabilidad, fiabilidad, seguridad, mantenibilidad y portabilidad | Métricas y umbrales por release                               |
| [ISO 9241-210:2019](https://www.iso.org/standard/77520.html)                                                                                                                                                                                                                | Diseño centrado en las personas y validación con contexto real                                                              | Flujos de usuario, pruebas móvil/teclado y feedback           |
| [IEEE 1012-2024](https://standards.ieee.org/ieee/1012/)                                                                                                                                                                                                                     | Verificación (construido según spec) y validación (resuelve la necesidad)                                                   | Plan V&V, revisión independiente y aceptación                 |
| [ISO/IEC/IEEE 29119](https://committee.iso.org/sites/jtc1sc7/home/projects/flagship-standards/isoiecieee-29119-series.html)                                                                                                                                                 | Testing basado en riesgo, niveles y documentación                                                                           | estrategia, casos, resultados y regresión                     |
| [SWEBOK v4.0a](https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4)                                                                                                                                                                              | Requirements, architecture, security, quality, testing, maintenance y operations                                            | prácticas en checklist y revisiones                           |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) + tutoriales W3C                                                                                                                                                                                                                  | Accesibilidad AA, formularios, foco y errores                                                                               | axe + teclado + lector + pruebas responsive                   |
| [ISO/IEC 27001:2022](https://www.iso.org/standard/27001.html) / [OWASP ASVS 5.0](https://owasp.org/projects/asvs)                                                                                                                                                           | Riesgo, datos locales, entradas no confiables y dependencias                                                                | controles, pruebas negativas, audit y no secretos             |
| [ISO/IEC 42001:2023](https://committee.iso.org/cms/live/live/en/sites/isoorg/contents/news/insights/AI/what-is-ai-all-you-need-to-know/newsBody/standard-reference/standard-reference%40/81230.html) + [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) | Gobernanza de agentes que modifican el repo; no convierte la calculadora en IA                                              | registro de prompts/decisiones, revisión humana, trazabilidad |

Las normas son referencias de ingeniería. Para afirmar conformidad se necesitarían alcance,
criterios contractuales, auditoría y evidencia externa; el proyecto no realiza esa afirmación.

## 2. Hallazgos priorizados: bug, causa, riesgo y corrección

Prioridad: **P0** bloquea cálculo o puede producir un importe incorrecto; **P1** rompe un flujo
común, accesibilidad o integridad de datos; **P2** degrada mantenibilidad, rendimiento o claridad.

| ID / prioridad | Evidencia y causa                                                                                                                                       | Por qué debe corregirse                                                                                                          | Corrección y prueba de regresión                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FE-01 P0       | `apps/web/src/hooks/useCalculos.ts`: el periodo hace `min/max(fechas ∪ hoy)`. Una entrada histórica se combina con hoy aunque no exista captura actual. | Infla días, puede disparar el límite de 31 días y cambia aguinaldo/periodo; el resultado legal deja de representar lo capturado. | Derivar `hoy` solo cuando no hay fechas válidas; definir periodo explícito en spec. Tests con fechas históricas, futuras, una fecha y entradas inválidas. |
| FE-02 P1       | `HistorialPeriodos.tsx` lee localStorage con `useLocalStorage` sin parser Zod. JSON con forma parcial puede llegar a `toFixed` y romper el árbol.       | Un dato corrupto persistente causa pantalla de error y pérdida de confianza; contradice Regla 8.                                 | Schema compartido para `PeriodoGuardado[]`, parser por clave, descarte + aviso y fixture corrupta (tipos, NaN serializado, campos extra).                 |
| FE-03 P1       | `EntradasPeriodo.tsx` limita `entradas.length` a 100, pero una fila puede emitir segmento diurno y nocturno.                                            | 51 filas mixtas pasan UI y luego fallan API por más de 100 segmentos.                                                            | Contar segmentos proyectados por fila y reservar margen; mostrar límite de segmentos e incentivo. Tests 50/51 filas y cada combinación.                   |
| FE-04 P1       | `IncentivosForm.tsx` no aplica límite 50 ni valida concepto en blanco antes de calcular.                                                                | El usuario descubre tarde un error de contrato y puede perder contexto de la fila inválida.                                      | Trim + validación inline, fila vacía omitida, límite 50 y `aria-describedby`; tests de whitespace, monto, máximo y mensaje.                               |
| FE-05 P1       | `ConfigInicial.tsx` valida fecha con regex, no calendario real.                                                                                         | Fechas como 2026-02-31 se guardan y fallan después en una fase distinta.                                                         | Reusar `esFechaCalendarioValida`, error junto al campo y prueba bisiesto/30-31/fecha imposible.                                                           |
| FE-06 P1       | Labels/selects y errores no siempre tienen asociación explícita; `aria-invalid` se replica en toda la fila y no enfoca el primer error.                 | Lectores de pantalla y teclado no saben qué campo corregir; el error es ambiguo.                                                 | IDs estables, `htmlFor`, `aria-describedby`, resumen de errores con foco y tests RTL/axe.                                                                 |
| FE-07 P1       | `GraficoPastel.tsx` depende de `role=img` sin alternativa tabular y el tooltip usa blur.                                                                | La información no es equivalente para lector, impresión o reduced-transparency; además conserva Liquid Glass.                    | Resumen textual/tabla accesible, colores de tokens, tooltip opaco y test sin `backdrop-filter`.                                                           |
| FE-08 P1       | En móvil `App.tsx` coloca resultado después de todos los formularios.                                                                                   | La decisión más importante queda fuera de pantalla; aumenta carga cognitiva y scroll.                                            | Orden móvil resultado→captura; desktop mantiene dos columnas. Test de orden DOM y screenshot 320 px.                                                      |
| FE-09 P1       | `TablaTasas.tsx` duplica tasas y usa `text-primary-light`, token inexistente en CSS.                                                                    | Puede mostrar una tasa distinta al motor y enlaces/clases sin efecto; es riesgo legal y visual.                                  | Importar datos desde `@calc/shared/tasas`, fecha/fuente centralizada y test de igualdad; eliminar clase huérfana.                                         |
| FE-10 P1       | `GuiaCalculos.tsx` usa `bg-accent`/`bg-accent-soft`, pero no existen en `@theme`; el build no genera esas clases.                                       | El flujo de guía aparece sin fondo/acento y oculta jerarquía visual.                                                             | Sustituir por tokens reales, añadir lint/test de tokens y revisión light/dark.                                                                            |
| FE-10b P1      | `App.tsx` usa `text-accent` y hay referencias `text-primary-light`/`text-muted` que tampoco existen en `@theme`.                                        | El build omite las clases: números, enlaces y metadatos pierden la jerarquía y el contraste previsto.                            | Sustituir por `text-primary`/`text-primary-soft`/`text-text-muted` declarados, añadir lint/test de tokens y revisar ambos temas.                          |
| FE-11 P2       | `index.css` y componentes aún contienen `.glass-*`, aurora, grain, sheen y `backdrop-filter`.                                                           | Rendimiento, contraste variable, preferencias de transparencia y decisión de producto contradictoria.                            | Migrar a superficies sólidas según `diseno-calculadora-clara.md`; `rg` prohibitivo como gate.                                                             |
| FE-12 P2       | Vite advierte bundle inicial de ~743 kB minificado (~213 kB gzip), con Recharts y vistas secundarias en la entrada.                                     | Aumenta LCP/INP en móviles y el coste de una calculadora simple.                                                                 | Lazy-load de gráfico/guía/historial, medir presupuesto y evitar regresión de bundle.                                                                      |
| FE-13 P2       | `ErrorBoundary` muestra `error.message` directamente.                                                                                                   | Un error inesperado puede filtrar detalles internos y no ofrece recuperación útil.                                               | Mensaje genérico + ID de soporte; log seguro sin salarios/stack en UI; prueba de excepción.                                                               |
| FE-14 P2       | Fechas y almacenamiento usan `new Date().toISOString()` en rutas de UI.                                                                                 | Cerca de medianoche UTC puede cambiar el día observado por la persona en El Salvador.                                            | Helper de fecha local agnóstico de TZ y tests con zona/medianoche; no usar ISO UTC para “hoy” de negocio.                                                 |

| FE-15 P1 | `useLocalStorage` silencia errores de cuota/acceso y aun así actualiza estado; el usuario ve “guardado” aunque se pierda al recargar. | La persistencia local es parte del producto; un falso positivo puede borrar configuraciones o historial sin aviso. | Devolver estado de persistencia, mostrar aviso accionable y probar cuota denegada/privado. |
| FE-16 P2 | `HistorialPeriodos` crece sin límite, no conserva fechaInicio/fechaFin ni permite recuperar el cálculo. | Puede agotar cuota y el historial no sirve para comparar o auditar qué periodo produjo el neto. | Definir alcance (resumen o restauración), límite/retención documentado, schema con periodo y prueba de migración. |
| FE-17 P1 | `JornadaSelector` parece una entrada de cálculo aunque solo es informativa. | Induce a pensar que cambiar modalidad transforma el resultado, especialmente a quien busca recargo nocturno. | Convertirlo en nota explicativa o indicador no editable; actualizar copy y test de que no altera el resultado. |
| FE-18 P2 | `NetoLiquido` usa `role=status` mientras el usuario escribe. | Un lector de pantalla puede anunciar cada cambio numérico y volver el formulario inutilizable. | Anunciar solo resultado válido/acción explícita con `aria-live=polite`; probar NVDA/VoiceOver o equivalente. |
| FE-19 P1 | Fórmulas, ejemplos y colores de `GuiaCalculos`/`GraficoPastel` están hardcodeados y no comparten `tasas.ts`/tokens. | Una tasa legal o tema puede quedar desactualizado aunque el motor sea correcto. | Derivar contenido permitido desde shared, marcar material informativo y test de sincronía/contraste. |

## 3. Entregables documentales y de agentes

Ya se actualizó el contrato operativo en `AGENTS.md`, `CLAUDE.md` y `CONTEXT.md`; se añadieron
`docs/ai-agents/README.md` y `review-checklist.md`. El mantenimiento futuro debe seguir esta
matriz:

| Documento            | Propósito                                             | Regla de sincronización                                         |
| -------------------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| `AGENTS.md`          | Autoridad para agentes, comandos, invariantes y gates | Cambiarlo si cambia arquitectura, scripts, seguridad o workflow |
| `CLAUDE.md`          | Índice corto para otro agente                         | No duplicar reglas; enlazar a `AGENTS.md`                       |
| `CONTEXT.md`         | Vocabulario y reglas de dominio                       | Solo conceptos actuales; histórico va a `docs/sesion-*`         |
| `docs/ai-agents/*`   | Gobernanza, evidencia y revisión humana               | Revisar en cada cambio de proceso asistido por IA               |
| `openspec/specs/*`   | Requisitos y comportamiento verificable               | Escribir antes de código de comportamiento                      |
| `.agents/adr/*`      | Decisiones y alternativas                             | Crear uno al cambiar arquitectura/diseño/seguridad              |
| `apps/web/DESIGN.md` | Tokens y componentes implementables                   | Sincronizar con spec visual, sin duplicar decisiones            |
| `CHANGELOG.md`       | Historial público de cambios                          | Añadir entrada en cada release o cambio visible                 |
| `docs/sesion-*`      | Contexto histórico                                    | Marcar `HISTÓRICO`; no usar como instrucciones                  |

Liquid Glass quedó marcado como supersedido en ADR-013/spec histórica y ADR-014 define la nueva
dirección; no se deben borrar las decisiones antiguas porque son parte de la trazabilidad.

## 4. Plan por fases (SDD)

### Fase 0 — Baseline y control de cambios (1 día)

- Capturar `git status`, versión Node/pnpm, `pnpm check`, cobertura, bundle y auditoría.
- Crear inventario de rutas, componentes, tokens CSS, localStorage y documentos normativos.
- Registrar baseline de axe/Lighthouse y capturas 320/768/1280 px en light/dark.
- Salida: `docs/quality/baseline-frontend.md` con fecha, comando, resultado y hash.

**Gate:** baseline reproducible; ningún cambio de cálculo entra junto con la migración visual sin
una spec y fixtures separadas.

### Fase 1 — Especificación, trazabilidad y riesgo (1–2 días)

- Convertir FE-01…FE-14 en requisitos `FR-FE-*`/`NFR-FE-*` con prioridad y riesgo.
- Crear `docs/quality/requirements-traceability.md`: requisito → OpenSpec → componente → test →
  evidencia → release.
- Actualizar `integridad-calculo.md` para derivación del periodo, parser de historial y contrato
  de límites UI/API.
- Crear threat model ligero: localStorage manipulable, XSS, filtración de salarios, dependencias,
  abuso API y datos en logs.

**Gate:** cada P0/P1 tiene oracle de prueba y criterio de aceptación; no se implementa una
preferencia estética sin hipótesis de usabilidad.

### Fase 2 — Correcciones P0/P1 de datos y contrato (2–4 días)

- Corregir FE-01…FE-05 en shared/hooks/forms/storage.
- Añadir tests de borde para calendario, zona horaria, límites y datos corruptos.
- Unificar mensajes de validación UI/API y mantener strict schemas.
- Actualizar contrato, persistencia, fixtures y CHANGELOG.

**Gate:** cálculo histórico no se altera por la fecha del dispositivo; corrupción local no rompe
la app; UI y API rechazan exactamente los mismos casos.

### Fase 3 — Accesibilidad y arquitectura de interacción (2–3 días)

- Corregir FE-06/FE-07: labels, foco, resumen, errores, tabla alternativa y estados semánticos.
- Reordenar FE-08: resultado primero en móvil y sticky seguro en escritorio.
- Probar teclado sin ratón, lector de pantalla, zoom 200 %, forced colors, reduced motion y
  impresión.
- Validar con al menos dos recorridos representativos: salario fijo y periodo con extras.

**Gate:** axe sin bloqueantes conocidos; todos los errores tienen campo, causa y acción; la salida
visual no es la única representación de un importe.

### Fase 4 — Migración visual “Calculadora clara y calmada” (2–4 días)

- Ejecutar `diseno-calculadora-clara.md` y ADR-014: tokens existentes, superficies opacas,
  radios moderados, jerarquía y divulgación progresiva.
- Renombrar clases `.glass-*` a semántica de superficie y eliminar blur/aurora/grain/sheen.
- Corregir FE-09/FE-10 y crear un chequeo que detecte clases Tailwind sin token.
- Mantener identidad SV con color y lenguaje, no con efectos patrióticos ni decoración que compita.

**Gate:** `rg` no encuentra técnicas prohibidas en código vigente; contraste se mide en ambos
temas; no hay cambios en fórmulas ni tasas por la migración.

### Fase 5 — Rendimiento, resiliencia y seguridad (1–3 días)

- Resolver FE-11…FE-14; dividir Recharts y vistas secundarias con imports dinámicos.
- Presupuestos iniciales a validar con baseline: JS inicial ≤300 kB gzip, LCP p75 <2.5 s,
  INP p75 <200 ms y CLS <0.1. Si el dispositivo real exige otra cifra, registrar la decisión.
- Revisar dependencias, CSP/headers, sanitización, errores, source maps y ausencia de datos
  salariales en telemetría.
- Ejecutar `pnpm audit --prod --audit-level=low`, análisis estático y revisión de secretos.

**Gate:** ninguna regresión de bundle o seguridad sin excepción documentada y fecha de expiración.

### Fase 6 — Verificación, validación y release (2 días)

- Unit: shared, hooks, schemas y reducers/forms.
- Integración: AppContext + localStorage + cálculo + historial.
- E2E: configuración → horas → incentivo → resultado; error de fecha; máximo; recuperación de
  localStorage; impresión.
- Accesibilidad: axe automatizado más revisión manual de teclado/lector.
- Visual: snapshots controlados por viewport/tema/estado, no snapshots frágiles de cada píxel.
- V&V independiente: otra persona o agente revisa contra la spec sin modificarla durante la
  evaluación.

**Gate de release:** `pnpm check` (install congelado, build, lint, tipos, tests y coverage), audit
limpio, matriz completa y smoke test de producción con rollback probado.

### Fase 7 — Operación y mejora continua

- Revisar métricas de errores, rendimiento, accesibilidad y abandono sin recopilar salarios.
- Revalidar tasas legales únicamente desde fuentes oficiales y actualizar `tasas.ts` + spec en
  el mismo cambio.
- Revisión trimestral de dependencias, ADRs supersedidos y documentación de agentes.
- Cada incidente produce causa raíz, prueba de regresión y actualización de la checklist.

## 5. Definition of Done (DoD)

Un bloque está terminado solo cuando:

- la spec y los criterios son verificables;
- existe test de regresión para cada bug y cobertura crítica de ramas;
- UI, shared y API aplican el mismo contrato;
- WCAG/axe, teclado, responsive, impresión y dark/light fueron revisados;
- bundle y métricas no superan presupuesto o tienen excepción temporal;
- no hay secretos, datos salariales en logs, dependencias vulnerables sin decisión ni tokens/clases
  huérfanos;
- documentación, ADR, CHANGELOG y matriz de trazabilidad están sincronizados;
- una revisión humana independiente aprueba la evidencia y el rollback.

## 6. Comandos de cierre

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm audit --prod --audit-level=low
pnpm --filter=@calc/web build
rg -n "glass-|backdrop-filter|Liquid Glass|aurora|grain|sheen|bg-accent|text-primary-light" \
  apps/web/src apps/web/DESIGN.md openspec/specs .agents/adr
```

La última búsqueda puede devolver únicamente referencias históricas explícitamente marcadas como
supersedidas; cualquier coincidencia en código vigente bloquea la entrega.
