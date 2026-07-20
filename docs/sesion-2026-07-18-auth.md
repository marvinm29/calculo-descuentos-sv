# Sesión: Auth con Clerk + SQLite + Migración a @clerk/react v6

**Fecha**: 2026-07-18

## Resumen

Se implementó autenticación con Clerk en la app, incluyendo backend (SQLite para historial por usuario) y frontend (login/register con Clerk). Se migró de `@clerk/clerk-react` v5 a `@clerk/react` v6 durante la sesión.

## Problemas encontrados y soluciones

### 1. Clerk v5 vs v6 — SDK cambió

**Error**: El dashboard de Clerk muestra la guía para `@clerk/react` (v6), pero el código inicial se escribió con `@clerk/clerk-react` (v5). Los componentes cambiaron de nombre.

**Solución**: Migrar a v6:
| v5 (old) | v6 (new) |
|----------|----------|
| `@clerk/clerk-react` | `@clerk/react` |
| `<SignedIn>` | `<Show when="signed-in">` |
| `<SignedOut>` | `<Show when="signed-out">` |
| `publishableKey={key}` en ClerkProvider | ClerkProvider lo lee de env, pero TS requiere la prop |

**Archivos modificados**:
- `apps/web/package.json` — `@clerk/clerk-react` → `@clerk/react@latest`
- `apps/web/src/main.tsx` — import de `@clerk/react`, publishableKey desde env
- `apps/web/src/App.tsx` — `SignedIn`/`SignedOut` → `Show when=`
- `apps/web/src/lib/api.ts` — import actualizado
- `apps/web/src/components/HistorialPeriodos.tsx` — import actualizado
- `apps/web/src/test/setup.ts` — mock actualizado para v6

### 2. `@clerk/express` v2 API cambió

**Problema**: En v2 de `@clerk/express`, `req.auth` es una función (`req.auth()`), no una propiedad. Además `requireAuth()` está deprecado.

**Solución**: Usar `getAuth(req)` de `@clerk/express`:
```typescript
import { getAuth } from '@clerk/express';

// En el controlador:
const { userId } = getAuth(req);
if (!userId) { res.status(401).json(...); return; }
```

### 3. ESLint: import() type annotations

**Problema**: `@typescript-eslint/consistent-type-imports` prohíbe `typeof import('...')` en `vi.importActual`.

**Solución**: Usar mock completo sin importActual:
```typescript
vi.mock('@clerk/express', () => ({
  getAuth: vi.fn(() => ({ userId: undefined })),
  clerkMiddleware: vi.fn(() => (_req, _res, next) => next()),
}));
```

### 4. ESLint: no-misused-promises con onClick

**Problema**: Función async en `onClick` que espera `() => void`.

**Solución**: Envolver con `() => { void guardar(); }`.

### 5. import.meta.env tipado

**Problema**: `import.meta.env` es `any`, ESLint lo marca como unsafe assignment.

**Solución**: Agregar `"vite/client"` a `types` en `tsconfig.json` y castear:
```typescript
const env = import.meta.env as Record<string, string>;
```

### 6. SQLite: directorio no existe

**Problema**: better-sqlite3 falla si el directorio `data/` no existe.

**Solución**: Crear directorio automáticamente en `db.ts` y usar `:memory:` para tests.

### 7. Puertos ocupados en dev

**Problema**: Al hacer `pnpm dev`, el puerto 5173 estaba ocupado y Vite usó 5174.

**Solución**: Matar procesos previos con `pkill -f vite` y `pkill -f "tsx watch"`.

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `apps/api/src/db.ts` | SQLite singleton con auto-creación de directorio |
| `apps/api/src/routes/history/history.service.ts` | CRUD sobre calculation_history |
| `apps/api/src/routes/history/history.controller.ts` | Handlers con `getAuth(req)` |
| `apps/api/src/routes/history/history.routes.ts` | POST/GET/DELETE `/api/history` |
| `apps/api/.env.example` | Template de variables de entorno |
| `apps/api/.gitignore` | Ignora data/, .env, dist/, coverage/ |
| `apps/web/src/lib/api.ts` | Helper `authFetch` con token Clerk |
| `apps/web/.env` | Keys de Clerk para desarrollo |
| `apps/api/.env` | Secret key + DB path |
| `apps/web/.env.example` | Template de vars frontend |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `apps/api/src/app.ts` | Agregado `clerkMiddleware()` + historyRoutes |
| `apps/api/vitest.config.ts` | Env vars DATABASE_PATH, CLERK_SECRET_KEY |
| `apps/api/test/calcular.test.ts` | Mock de @clerk/express |
| `apps/api/test/history.test.ts` | Nuevo (10 tests) |
| `apps/web/src/main.tsx` | ClerkProvider de @clerk/react |
| `apps/web/src/App.tsx` | `Show when=` en header |
| `apps/web/src/components/HistorialPeriodos.tsx` | Sync server + localStorage |
| `apps/web/src/test/setup.ts` | Mock de @clerk/react v6 |
| `apps/web/vitest.config.ts` | define para import.meta.env |
| `apps/web/tsconfig.json` | Agregado `"vite/client"` a types |
| `apps/web/package.json` | @clerk/clerk-react → @clerk/react |

## Tests finales: 157

- `packages/shared`: 86 tests
- `apps/api`: 25 tests (15 calcular + 10 history)
- `apps/web`: 46 tests (RTL con Clerk mockeado)

## Pendiente

- **Clerk Dashboard**: Agregar `http://localhost:5173` a Allowed Origins (opcional en dev mode)
- **Fase 2**: Migrar backend a DigitalOcean + dominio `marvinmelendez.engineer`
