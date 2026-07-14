---
name: vitest-rtl-supertest
description: Patrones de testing para el stack Vitest + React Testing Library + Supertest. Úsala SIEMPRE que se escriba o edite un .test.ts/.test.tsx, se agregue coverage, se validen endpoints Express, o se cree un fixture. Garantiza coverage > 80% (enforced en vitest.config), co-ubicación de tests, naming como documentación, y discriminación entre unitarios / componentes / API. También cuando el usuario mencione test, spec, coverage, assertion, snapshot, Supertest o RTL.
license: MIT
metadata:
  stack: vitest-react-testing-library-supertest
---

# Testing en este repo

## Configuración base

- Vitest corre con `pnpm test` desde la raíz (workspace).
- Coverage enforced en `vitest.config.ts` con `coverage.thresholds.lines/functions/branches/statements = 80`. Si baja, CI falla.
- Test files co-ubicados: `Componente.tsx` ↔ `Componente.test.tsx`, `calc.ts` ↔ `calc.test.ts`.

## Tres tipos de test, tres ubicaciones

| Tipo | Dónde | Lib | Qué cubre |
| --- | --- | --- | --- |
| Unitario | junto a fuente en `packages/shared/src/` | Vitest | Lógica pura (cálculos, utilidades). Sin DOM, sin HTTP. |
| Componente | junto a fuente en `apps/web/src/` | RTL + jsdom | Render de React, interacción, estado, persistencia mock. |
| API | `apps/api/test/` | Supertest + Vitest | Endpoints Express, status code, body, validación Zod. |

## Naming como documentación (regla del repo)

Describe **comportamiento**, no implementación. Mal: `test('isss')`. Bien:

```ts
describe('calcularDescuentos', () => {
  describe('ISSS', () => {
    it('aplica 3% sobre salario bruto cuando está bajo el tope', () => {
      const r = calcularDescuentos({ salarioBruto: 800 });
      expect(r.isss.descuento).toBe(24);
    });
    it('topa a $30 cuando el bruto supera $1000', () => {
      const r = calcularDescuentos({ salarioBruto: 1500 });
      expect(r.isss.descuento).toBe(30);
    });
  });
});
```

## Cobertura > 80% — qué means

- Cada `feature` de `packages/shared` debe pasar el umbral por función, no promedio.
- Cero `istanbul ignore` sin justificación en comentario.
- Casos borde obligatorios para cálculos: salario 0, salario exacto en tope ($1000, $6843.48), tramo límite de renta ($338.67, $761.90, $1904.76), antigüedad límite (1 año, 3 años, 10 años).

## Fijos clave

- Salario $800 mensual → ISSS 24, AFP 58, Renta 55.60, base gravable 718.00 (tramo II).
- Ejemplo $800 quincenal del `specs/api-contract.md` → usar como test de integración del orquestador `calcular()`.
- Festivos salvadoreños: ver `specs/tasas-legales.md` §Días de Asueto.

## Test de componente (RTL)

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigInicial } from './ConfigInicial';

it('guarda salario positivo y persiste en localStorage', async () => {
  const user = userEvent.setup();
  render(<ConfigInicial onSave={vi.fn()} />);
  await user.type(screen.getByLabelText(/salario base/i), '800');
  await user.click(screen.getByRole('button', { name: /guardar/i }));
  expect(localStorage.getItem('config')).toContain('"salarioBase":800');
});
```

Patrones:
- Usa `screen.getBy*` preferentemente, NO `container.querySelector`.
- `userEvent` sobre `fireEvent` para simular interacciones realistas.
- Limpia `localStorage` en `beforeEach`.
- Testea estado, no detalles de markup. Si cambias clases, el test no debe romperse.

## Test de API (Supertest)

```ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('POST /api/calcular', () => {
  it('400 con details cuando salarioBase <= 0', async () => {
    const res = await request(app)
      .post('/api/calcular')
      .send({ salarioBase: -5, /* … */ });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: 'VALIDATION_ERROR',
      details: expect.arrayContaining([
        expect.objectContaining({ field: 'salarioBase' }),
      ]),
    });
  });

  it('429 después de 100 requests/min', async () => {
    // disparar 101 y asserts el último 429
  });
});
```

Cubre happy path, 400 `VALIDATION_ERROR` con `details`, 429 `RATE_LIMIT_EXCEEDED`, 500 `INTERNAL_ERROR`.

## Snapshot policy

- NUNCA snapshots de strings HTML grandes. Frágiles y ruidosos.
- Usa snapshots solo para salida numérica estructurada (ej. `calcular()` response) y bórralos si cambian frecuentemente.
- Preferir assertions explícitas siempre que sea posible.

## Antes de cerrar un test

- [ ] Nombre describe comportamiento.
- [ ] Cubre el happy path Y al menos un caso borde (tope, tramo, cero).
- [ ] No usa `any`. 
- [ ] `pnpm test -- --coverage` pasa y mantiene umbral > 80% en el archivo feature tocado.
- [ ] No deja `console.log`/`debug` en el test.