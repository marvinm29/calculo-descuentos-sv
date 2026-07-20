# Sprint 8 — Producción: Deploy a DigitalOcean + Monitoreo + Hardening

**Fecha**: 2026-07-19

## Resumen

Se completó el Sprint 8 para llevar el proyecto a producción:
- **Hosting**: API migrada de Render.com a DigitalOcean droplet
- **Monitoreo**: Sentry + Datadog integrados (condicionales, faltan keys de prod)
- **Hardening**: `clerkMiddleware()` scoped, logger Morgan, error stack traces
- **DNS**: name.com con `api.marvinmelendez.engineer` → droplet, `marvinmelendez.engineer` → GitHub Pages

---

## Problemas encontrados y soluciones

### 1. `ecosystem.config.cjs` rompía ESLint

**Error**: ESLint fallaba con `Parsing error: ecosystem.config.cjs was not found by the project service`.

**Causa**: El archivo PM2 recién creado no estaba en el tsconfig ni ignorado.

**Solución**: Agregar `{ ignores: ['ecosystem.config.cjs'] }` al ESLint config de API. Al arreglarlo, se revelaron 10 lint errors pre-existentes que quedaban ocultos.

### 2. 10 lint errors pre-existentes (type-aware lint + barrel exports)

**Error**: ESLint con `typescript-eslint/recommendedTypeChecked` no puede resolver tipos importados a través del barrel `@calc/shared` (usa `.js` extensions en `export * from`).

**Archivos afectados**: `calcular.controller.ts`, `calcular.service.ts`, `history.controller.ts`

**Estado**: Parcialmente solucionado. Pendiente relajar `no-unsafe-*` rules para `src/routes/**/*.ts`.

### 3. `sshd_config` prompt en `apt upgrade`

**Solución**: `DEBIAN_FRONTEND=noninteractive` al inicio del script.

### 4. `gpg: cannot open '/dev/tty'` al instalar Caddy

**Solución**: Cambiar a instalación de Caddy vía binario directo (curl + systemd service).

### 5. `fatal: destination path '.' already exists` en droplet

**Solución**: Detectar si `.git` existe y hacer `git fetch origin && git reset --hard origin/main`.

### 6. `pm2 start` — script already launched

**Solución**: Agregar flag `-f` para forzar re-ejecución.

### 7. CI sigue fallando con los mismos 10 lint errors

**Causa raíz**: Los archivos `calcular.controller.ts`, `calcular.service.ts` y `history.controller.ts` no se incluyeron en el commit de Sprint 8 (`git add` no los listó). Los fixes locales nunca subieron a `main`.

---

## Archivos modificados

### Sprint 8 — Código

| Archivo | Cambio |
|---------|--------|
| `apps/api/src/app.ts` | `clerkMiddleware()` scoped a `/api/history`; Morgan logger; Sentry condicional |
| `apps/api/src/index.ts` | dd-trace init al inicio (condicional vía env vars) |
| `apps/api/src/middleware/errorHandler.ts` | `console.error` con stack trace en errores 500 |
| `apps/web/src/main.tsx` | Sentry condicional si `VITE_SENTRY_DSN` está seteado |
| `apps/web/.env.example` | `VITE_SENTRY_DSN`, `VITE_ENV`; `VITE_API_URL` apunta a prod |
| `apps/api/.env.example` | `NODE_ENV`, `SENTRY_DSN`, `DD_API_KEY`, `DD_SITE` |
| `apps/web/package.json` | `@sentry/react` agregado |
| `apps/api/package.json` | `@sentry/node`, `dd-trace`, `morgan`, `@types/morgan` |
| `apps/api/eslint.config.js` | Ignorar `ecosystem.config.cjs` |
| `apps/api/ecosystem.config.cjs` | Clerk key hardcodeada removida |

### Setup droplet

| Archivo | Cambio |
|---------|--------|
| `docs/setup-droplet.sh` | `DEBIAN_FRONTEND=noninteractive`; Caddy binario directo; `pm2 -f`; `pm2 save || true`; `git fetch + reset` si ya clonado; sin keys hardcodeadas |

---

## Estado actual de servicios

| Servicio | URL | Estado |
|----------|-----|--------|
| API (DO droplet) | `https://api.marvinmelendez.engineer` | ✅ Live (PM2 + Caddy) |
| Web (GitHub Pages) | `https://marvinmelendez.engineer` | ⬜ Pendiente de CI verde |
| API (Render, legacy) | `https://calculo-descuentos-sv.onrender.com` | ⬜ Legacy (reemplazar por DO) |

---

## Tests: 157

- `packages/shared`: 86 tests
- `apps/api`: 25 tests (15 calcular + 10 history)
- `apps/web`: 46 tests (RTL)

---

## Pendiente

### Alto — Bloqueante para producción

1. **Fix CI lint errors**: Agregar `no-unsafe-*: off` para `src/routes/**/*.ts` en `apps/api/eslint.config.js`
2. **DNS Clerk en name.com**: Agregar 5 CNAME records:

   | Host | Target |
   |------|--------|
   | `accounts` | `accounts.clerk.services` |
   | `clerk` | `frontend-api.clerk.services` |
   | `clk._domainkey` | `dkim1.397fcatvfzb1.clerk.services` |
   | `clk2._domainkey` | `dkim2.397fcatvfzb1.clerk.services` |
   | `clkmail` | `mail.397fcatvfzb1.clerk.services` |

3. **Actualizar Clerk keys a producción**: reemplazar test keys por live keys en todos los `.env`

4. **Clerk Dashboard**: Agregar Allowed Origins → `https://marvinmelendez.engineer`, `https://api.marvinmelendez.engineer`. Correr DNS verification.

### Medio — Monitoreo

5. **Sentry**: Crear proyectos React + Express en sentry.io → copiar DSNs → agregar a `.env` files
6. **Datadog**: Copiar API key completa → agregar `DD_API_KEY` + `DD_SITE=us5.datadoghq.com` al `.env` del droplet

### Bajo — Mejoras

7. **CI warning**: Node.js 20 deprecado en GitHub Actions (no blocker)
8. **Duplicado PM2**: Ya resuelto (`pm2 delete 0 && pm2 save`)
