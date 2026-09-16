# ⚠️ HISTÓRICO / SUPERADO — NO USAR COMO GUÍA

> Los pasos de despliegue de esta sesión fueron reemplazados por `docs/setup-droplet.sh`
> endurecido (2026-09-15): versiones fijadas, usuario de servicio, `.env` fuera del checkout,
> despliegue versionado con rollback y Express sólo en loopback. Ver `CHANGELOG.md` y ADR-011.

# Sesión: deploy y fixes post-sprints

**Fecha**: 2026-07-13

## Resumen

Se completaron los 7 sprints del proyecto y se procedió a hostear:
- **Web**: GitHub Pages via CI workflow
- **API**: Render.com

## Problemas encontrados y soluciones

### 1. Render: `ERR_MODULE_NOT_FOUND` con ESM

**Error**: Node.js no resolvía imports relativos sin extensión `.js` en el output compilado.

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../dist/app' imported from .../dist/index.js
```

**Causa**: TypeScript con `moduleResolution: "bundler"` y `verbatimModuleSyntax: true` compila imports ESM sin agregar `.js`. Node.js ESM requiere extensiones explícitas.

**Archivos modificados**:

| Archivo | Cambio |
|---------|--------|
| `packages/shared/src/index.ts` | 7 `export *` agregaron `.js` |
| `packages/shared/src/calc/horasExtra.ts` | `'../tasas'` → `'../tasas.js'` |
| `packages/shared/src/calc/descuentos.ts` | `'../tasas'`, `'./horasExtra'` → `.js` |
| `packages/shared/src/calc/prestaciones.ts` | `'../tasas'`, `'./horasExtra'` → `.js` |
| `packages/shared/src/calc/calcular.ts` | 3 imports `./` → `.js` |
| `apps/api/src/index.ts` | `'./app'` → `'./app.js'` |
| `apps/api/src/app.ts` | 2 imports `./` → `.js` |
| `apps/api/src/routes/calcular/calcular.routes.ts` | `'./calcular.controller'` → `.js` |
| `apps/api/src/routes/calcular/calcular.controller.ts` | `'./calcular.service'` → `.js` |

**Nota**: Los `import type` no necesitan `.js` porque `verbatimModuleSyntax` los borra del output compilado.

### 2. Render: versión de Node.js

Se agregó `"engines": { "node": ">=22" }` en `apps/api/package.json` para que Render use Node 22+ en vez del default.

### 3. CI/GitHub Pages: pnpm version conflict

**Error**: `Multiple versions of pnpm specified: - version 9 in the GitHub Action config - version pnpm@9.15.9 in the package.json`

**Solución**: Eliminar `version: 9` de `pnpm/action-setup@v4` en `.github/workflows/ci.yml`. El action detecta la versión automáticamente desde el campo `packageManager` en `package.json`.

### 4. Error `pages:write permission`

No ocurrió en esta sesión, pero es un error común en GitHub Pages. Requiere que el workflow tenga `permissions: { pages: write, id-token: write }` (ya configurado).

## Estado final

| Servicio | URL | Estado |
|----------|-----|--------|
| API (Render) | `https://calculo-descuentos-sv.onrender.com` | ✅ Live |
| Web (GitHub Pages) | `https://marvinm29.github.io/calculo-descuentos-sv/` | ⬜ Pendiente de CI verde |

## Comandos de verificación

```bash
# Probar API
curl -X POST https://calculo-descuentos-sv.onrender.com/api/calcular \
  -H "Content-Type: application/json" \
  -d '{"salarioBase":800,"tipoPago":"mensual","fechaInicio":"2026-07-01","fechaFin":"2026-07-31","antiguedad":"1_a_3","fechaIngreso":"2025-01-15","segmentos":[]}'

# Verificar build local
pnpm lint && pnpm check-types && pnpm test
pnpm turbo run build --filter=@calc/web
pnpm --filter=@calc/api build
```

## Tests finales: 147

- `packages/shared`: 86 tests
- `apps/api`: 15 tests (Supertest)
- `apps/web`: 46 tests (RTL)
