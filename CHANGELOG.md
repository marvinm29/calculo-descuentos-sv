# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/); versionado por fecha de corte.

## 2026-09-27 — Limpieza de identidad "15 de septiembre" y retiro de Jornada

### Removed

- **Identidad de Independencia**: eliminados los componentes `Torogoz` y `MonumentoSalvador` (y sus
  tests), el badge `15·IX` del header y el pie "Mes de la Independencia · 15 de septiembre". Sin
  referencias patrióticas ni temáticas de septiembre.
- **Token dorado**: eliminado `--gold`/`--color-gold`, la clase `.gold-rule` y las animaciones
  `torogoz-float`/`monumento-stroke` (y sus exclusiones en `prefers-reduced-motion`/print/forced
  colors). `NetoLiquido` usa ahora `border-success/30`.
- **Sección Jornada**: eliminados `JornadaSelector` (y su test), el estado `jornada`/`setJornada`
  de `AppContext` y la sección en `App.tsx`. La modalidad diurna/nocturna no alimentaba el cálculo
  ni se enviaba al API; era un residuo del recargo nocturno inferido retirado el 2026-09-15.
- La clave `jornada-config` se agrega a `CLAVES_MUERTAS` (se elimina del navegador al cargar).
- Código muerto depurado: `JornadaConfig`, `ModalidadJornada`, `jornadaConfigSchema` y
  `modalidadJornadaSchema` de `@calc/shared`; la utility CSS `.focus-ring`; y la clase colgante
  `rule` (usada en `App.tsx` pero inexistente en CSS). Se conservan `JORNADA` y
  `RECARGO_NOCTURNIDAD` por ser referencia legal documentada en las specs.

### Fixed

- **Accesibilidad del gráfico (FE-07)**: `GraficoPastel` exponía sectores de Recharts con
  `role="img"` y un `div` con `tabindex` dentro de `aria-hidden`, fallando `svg-img-alt` y
  `aria-hidden-focus` (Lighthouse 96 con datos). Ahora el SVG es decorativo (`aria-hidden`,
  `accessibilityLayer={false}`, `rootTabIndex={-1}`) y la **tabla** es la representación
  accesible. Accesibilidad con datos: 96 → 100.

### Changed

- Renumeración de secciones en la UI: 01 Configuración · 02 Horas del periodo · 03 Incentivos ·
  04 Tasas de ley. Header y pie simplificados.
- Specs/docs sincronizadas: `captura-horas.md` (Jornada retirada), `persistencia.md`,
  `integridad-calculo.md` (Regla 7), `diseno-calculadora-clara.md` (sin `gold`),
  `apps/web/DESIGN.md`, `CONTEXT.md`, `AGENTS.md`, `specs/requirements.md`,
  `specs/architecture.md` y trazabilidad (`FR-FE-17`).
- `JornadaConfig`/`modalidadJornadaSchema` permanecen exportados en `@calc/shared` sin consumidor
  en web (retirarlos requiere decisión explícita por ser interfaz pública).

### Tests

- `@calc/web`: 177 → 165 (se retiraron `Torogoz.test`, `MonumentoSalvador.test` y
  `JornadaSelector.test`; `storage.test` y `App.test` cubren la clave muerta y la sección ausente).

## 2026-09-27 — Auditoría P1/P2 (fases 0–4) y estabilización de `App.test`

Auditoría de hallazgos residuales sobre la ejecución de fases 0–4. Matriz actualizada:
`docs/quality/requirements-traceability.md` (FR-FE-20 … FR-FE-25).

### Fixed

- **Contrato estricto recursivo (FR-FE-20)**: `segmentoHorarioSchema` e `incentivoSchema` pasan a
  `z.strictObject`; claves desconocidas anidadas se rechazan con path del contenedor
  (`segmentos.0`, `incentivos.0`) tanto en shared como en el API.
- **FE-08 sin `order-*`**: el orden móvil/teclado se logra por orden real del DOM (resultado
  primero) e inversión visual en escritorio con grid (`lg:col-start-1/2`), no con `order`.
- **Regla 4 en cliente (FR-FE-21)**: `NaN`/±`Infinity`/negativos/rango de horas y montos no
  alimentan el cálculo; el error es inline, asociado a los campos y no bloqueante.
- **FE-06**: el submit de `ConfigInicial` enfoca el primer campo con error (`primerErrorConfig`).
- **FR-FE-22**: un periodo histórico sin `fechaIngreso` entra en estado de error accionable; no se
  sustituye la fecha por `hoy` (evita fabricar `fechaIngreso > fechaFin`).
- **FR-FE-23**: `historial-periodos[].fecha` se valida como timestamp ISO UTC canónico; historial
  corrupto → clave descartada, aviso y auto-sanado a `[]`.
- **FR-FE-24**: `useLocalStorage` escribe en `useEffect` (updater puro; sin side-effects en
  `setState`), con escritura inicial al montar y recuperación del estado `ok` tras fallo.
- Fixture del API: `password=hunter2` reemplazado por un sentinel neutral (sin credenciales en
  tests).
- **Contraste WCAG (Auditoría axe/Lighthouse)**: `.btn-accent` usaba blanco sobre el azul claro
  del tema oscuro (2.26:1). Nuevo token `--on-accent` (blanco en claro, casi negro en oscuro);
  accesibilidad Lighthouse 96 → 100.
- `apps/web/index.html`: añadida `meta description`; SEO Lighthouse 60 → 80 (queda `robots.txt`).

### Changed

- **FR-FE-25 (FE-12)**: `GuiaCalculos` (lazy) se monta recién al abrir su `<details>`, en lugar de
  suspenderse en paralelo con el gráfico y el historial en el primer render. Corrige el cuelgue
  reproducible de `App.test.tsx` bajo `act` con `success` y evita descargar la guía si no se abre.
- `specs/tasas-legales.md`: nueva sección **Estado de verificación de fuentes (2026-09-20)** —
  Quincena 25 y hora extra diurna 2.00× verificadas en fuente primaria; ISSS/AFP/renta y hora
  extra nocturna 2.25× pendientes de confirmación primaria (esta última ambigua, sin cambios).
  `FECHA_ACTUALIZACION_TASAS` intacta (`Julio 2026`).

### Tests

- `@calc/shared`: 129 · `@calc/api`: 41 · `@calc/web`: 177 (23 archivos). Gate
  `pnpm lint && pnpm check-types && pnpm test`.

## 2026-09-20 — Corrección P0/P1 del frontend y migración "Calculadora clara y calmada"

Ejecución de las fases 0–4 de `docs/plan-frontend-calidad-sdd.md`. Matriz completa:
`docs/quality/requirements-traceability.md`.

### Fixed

- **FE-01 (P0)**: `useCalculos` ya no mezcla `hoy` con fechas históricas — el periodo se deriva
  solo de fechas capturadas; `hoy` se usa únicamente cuando no hay ninguna (`useCalculos.ts`).
- **FE-02**: `historial-periodos` se valida con `historialPeriodosSchema` (Zod, `strictObject`,
  nuevo en `@calc/shared`); JSON corrupto → clave eliminada + aviso local + arranque limpio
  (`HistorialPeriodos.tsx`).
- **FE-03**: el límite de 100 segmentos se aplica sobre la **proyección** de segmentos por fila
  (una fila mixta proyecta dos), no sobre filas; contador visible en `EntradasPeriodo`.
- **FE-04**: incentivos con límite 50, error inline por concepto en blanco (incluye espacios) y
  exclusión de filas inválidas del request (`IncentivosForm.tsx`, `incentivosValidos`).
- **FE-05**: `fechaIngreso` validada con `esFechaCalendarioValida` (calendario real, bisiesto),
  no solo regex (`ConfigInicial.tsx`).
- **FE-06**: errores de fila con ID estable, `aria-invalid` solo en campos causantes y
  `aria-describedby` explícito (`EntradasPeriodo`, `IncentivosForm`, `ConfigInicial`).
- **FE-07**: gráfico con tabla alternativa accesible, `role="img"` con nombre, colores desde
  tokens y tooltip opaco sin blur (`GraficoPastel.tsx`).
- **FE-08**: en móvil el resultado precede a la captura (`order-1`/`order-2`, se invierte en lg).
- **FE-09/FE-19**: tabla de tasas y guía de cálculos derivadas de `@calc/shared/tasas` con
  `FECHA_ACTUALIZACION_TASAS` compartida; sin tasas ni colores hardcodeados.
- **FE-10/FE-10b**: eliminadas clases sin token (`bg-accent`, `text-accent`, `text-primary-light`,
  `bg-accent-soft`).
- **FE-13**: `ErrorBoundary` muestra mensaje genérico + ID de soporte; el error interno solo va a
  la consola del navegador.
- **FE-14**: helper `hoyLocal()` (componentes Y/M/D locales); prohibido `toISOString()` para
  fechas de negocio (`lib/fecha.ts`).
- **FE-15**: `useLocalStorage` expone estado de persistencia; aviso accionable en UI si la
  escritura falla (cuota/modo privado).
- **FE-17**: `JornadaSelector` convertido en nota informativa no editable; sin radios.
- **FE-18**: el neto se anuncia con `aria-live="polite"` solo tras estabilizar el valor
  (debounce 800 ms), no en cada pulsación.

### Changed

- **FE-11 (migración visual)**: `index.css` reescrito — superficies sólidas (`panel`,
  `site-header`, `result-card`), sin `backdrop-filter`/blur/aurora/grain/sheen ni clases sin
  token; `forced-colors` soportado; tokens alineados a `diseno-calculadora-clara.md` (`bg`,
  `border-soft`).
- **FE-12 (rendimiento)**: Recharts (`GraficoPastel`), `HistorialPeriodos` y `GuiaCalculos` en
  carga diferida. Bundle inicial: 742.87 kB → 371.97 kB (gzip 213.21 → 113.94 kB, −46%).
- **FE-16**: historial con retención máxima de 50 periodos (recorte FIFO)
  (`LIMITES_CONTRATO.MAX_HISTORIAL`).
- Specs actualizadas antes del código: `captura-horas.md` (límite proyectado, incentivos,
  fecha local, jornada informativa), `persistencia.md` (schema de historial, estado de
  persistencia), `integridad-calculo.md` (Regla 6 UI, derivación local), `diseno-calculadora-clara.md`
  (anuncios, gráficos, errores de fila), `specs/tasas-legales.md` (`FECHA_ACTUALIZACION_TASAS`).
- Tests: 110 → 147 en `@calc/web` (37 pruebas de regresión nuevas).

## 2026-09-20 — Gobierno de agentes y plan de calidad frontend

### Added

- `docs/ai-agents/README.md` y `docs/ai-agents/review-checklist.md` con orden de autoridad,
  flujo SDD, límites de seguridad y evidencia exigible a agentes de IA.
- `docs/plan-frontend-calidad-sdd.md` con auditoría de bugs, trazabilidad, adopción adaptada de
  ISO/IEC/IEEE, WCAG, SWEBOK y gates de entrega.
- `openspec/specs/diseno-calculadora-clara.md` y ADR-014 como nueva dirección visual sin Liquid
  Glass.

### Changed

- `AGENTS.md`, `CLAUDE.md` y `CONTEXT.md` ahora distinguen instrucciones vigentes de sesiones
  históricas y no asumen skills inexistentes.
- `apps/web/DESIGN.md` y `openspec/specs/diseno-visual.md` apuntan a superficies sólidas,
  jerarquía de contenido y accesibilidad WCAG 2.2 AA.

### Deprecated

- Liquid Glass SV (ADR-013 y `openspec/specs/diseno-liquid-glass-sv.md`) queda supersedido; se
  conserva únicamente como historial de decisión.

## 2026-09-15 — Integridad de cálculo, endurecimiento de seguridad y documentación

Especificación rectora: `openspec/specs/integridad-calculo.md` (nueva).

### Added

- Spec OpenSpec `integridad-calculo.md` con 10 reglas: fechas de calendario reales, segmentos
  dentro del período, acumulado máximo 24 h/día, números finitos/no negativos, período máximo
  31 días inclusivos, máximos de colecciones (100 segmentos / 50 incentivos), persistencia
  local validada, CORS/proxy y errores sin filtración.
- Validaciones compartidas en `@calc/shared/schemas.ts`: `esFechaCalendarioValida`,
  `LIMITES_CONTRATO`, schemas de persistencia (`entradaPeriodoSchema`, `jornadaConfigSchema`,
  `configInicialPersistenciaSchema`, `incentivosGuardadosSchema`).
- Parsing validado de localStorage (`apps/web/src/lib/storage.ts`): Zod por clave, limpieza de
  claves muertas (`registro-periodo`, `registro-semanal`), aviso en UI cuando se descartan
  datos corruptos (`clavesDescartadas` en `AppContext`).
- Feedback de validación en `EntradasPeriodo` (fecha inválida, horas fuera de rango, suma
  diaria > 24 h) y tope de 100 entradas en la UI.
- `createApp()` factory en la API con opciones de CORS, trust proxy, rate limit y Sentry;
  tests de CORS (origen permitido/no permitido), rate limit por IP real con `X-Forwarded-For`
  (`TRUST_PROXY=1`) y 500 sin filtración de detalles.
- Scripts de cobertura explícitos por workspace + `pnpm coverage` raíz (Turbo, sin caché).
  Cobertura ≥ 80% en los 4 indicadores por paquete (api, web, shared).
- Script de despliegue endurecido `docs/setup-droplet.sh`: versiones fijadas, repos oficiales,
  usuario de servicio sin login, `.env` fuera del checkout, despliegue versionado con rollback,
  Express sólo en loopback.

### Changed

- **Contrato API estricto**: el request rechaza campos desconocidos; se eliminó
  `horasBaseNocturnas` del request y `recargoNocturnidad` del response — no existe recargo
  nocturno inferido. Los factores 2.25× (extra nocturna) y 1.75× (día libre nocturna)
  permanecen sin doble recargo. Rompe compatibilidad con clientes que envíen el campo.
- La UI deriva `fechaInicio`/`fechaFin` de las fechas capturadas ∪ {hoy} y aplica las mismas
  validaciones que el API antes de calcular.
- `app.listen` enlaza a `127.0.0.1` por defecto (hardening; `HOST` configurable).
- Dependencias: `express` 5.2.1, `morgan` 1.12.x, `@sentry/node` + `@sentry/react` 10.x,
  `dd-trace` 5.127.x, override `js-yaml` → 4.3.2. `pnpm audit --prod --audit-level=low`
  sin hallazgos.

### Removed

- Recargo nocturno regular inferido (`horasBaseNocturnas`, `calcularRecargoNocturnidad`,
  `recargoNocturnidad` en `BrutoResponse`, heurística por modalidad en la UI). Su
  reintroducción requiere captura explícita de horas regulares y nueva spec jurídicamente
  validada (ver `openspec/specs/dominio-calculo.md`).

### Docs

- Sincronizados `specs/api-contract.md`, `openspec/specs/{contrato-calcular,captura-horas,
dominio-calculo,persistencia}.md`, `README.md`, `CONTEXT.md` y `AGENTS.md` con la
  arquitectura vigente: API público y stateless, sin Clerk/SQLite/historial remoto (ADR-011).
- ADR-011 reforzado: política de no reintroducción de identidad/BD sin nuevo ADR.
- Notas de sesión en `docs/` marcadas como histórico/superado.
