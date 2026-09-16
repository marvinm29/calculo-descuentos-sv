# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/); versionado por fecha de corte.

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
