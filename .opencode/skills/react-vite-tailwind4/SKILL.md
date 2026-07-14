---
name: react-vite-tailwind4
description: Convenciones para crear y editar componentes React 19 + Vite 8 + TailwindCSS v4 en apps/web. Úsala SIEMPRE que se cree un componente .tsx, se agregue un hook custom, se modifique App.tsx, se agregue state, o se edite styles. Garantiza componentes funcionales, co-ubicación de tests, Prettier settings exactos (printWidth 90, singleQuote, semi, trailingComma all, arrowParens always), y Tailwind v4 CSS-first (sin tailwind.config.js). También aplica cuando el usuario pida UI, formulario, vista, pantalla, o layout.
license: MIT
metadata:
  stack: react19-vite8-tailwind4
---

# React + Vite + Tailwind v4

## Reglas del repo (no negociables)

- **Componentes funcionales + hooks.** NUNCA clases. Un componente por archivo (subcomponentes privados permitidos en el mismo archivo si son < ~30 líneas).
- **Props como `interface` exportada.** NUNCA `type` para props.
- **PascalCase** para componentes, **camelCase** para hooks/helpers. Hooks empiezan con `use`.
- **Co-ubicar tests**: `Componente.test.tsx` al lado de `Componente.tsx`.
- **`import type`** para tipos que no se usan como valor.
- **Discriminated unions** para estados de datos: `{ status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: E }`.
- **Sin `any`.** Usa `unknown` + type narrowing.

## Estilo (Prettier — estos son los valores exactos del repo, NO el default)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 90,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

`printWidth: 90` es **no default** (default 80) — el linter falla si lo cambias.

## Tailwind v4 (CSS-first, NO uses tailwind.config.js)

Tailwind v4 se configura en CSS, no en JS:

```css
/* apps/web/src/index.css */
@import 'tailwindcss';

@theme {
  --color-primary: #1f2937;
  --breakpoint-sm: 640px;
  /* … breakpoints del repo: 320 / 640 / 768 / 1024 / 1280 */
}
```

Usa utility classes directamente. Para componentes repetitivos, prefiere composition (`@apply` moderado) antes que abstracciones complejas. NUNCA CSS-in-JS (styled-components/emotion) — está excluido por ADR-004.

## Estructura de un componente

```tsx
import { useState } from 'react';
import type { FormEvent } from 'react';

export interface ConfigInicialProps {
  onSave: (config: Config) => void;
  initial?: Config;
}

export function ConfigInicial({ onSave, initial }: ConfigInicialProps) {
  const [salario, setSalario] = useState<number>(initial?.salarioBase ?? 0);
  // …
  return (
    <form onSubmit={handleSubmit}>
      {/* … */}
    </form>
  );
}
```

## Hooks custom

- Archivo `hooks/useAlgo.ts`, exporta `useAlgo`.
- Encapsula estado + efectos; devuelve valores primitivos o un objeto estable.
- `useLocalStorage` y `useCalculos` son los hooks raíz del estado del frontend (ver `specs/architecture.md` §Estrategia de Estado).

## Estado y persistencia

- Config inicial → `localStorage` (vía `useLocalStorage`).
- Registro semanal → `Map<semanaId, Dia[]>` en `localStorage`.
- Cálculos → derivados con `useMemo` desde config + registro. NUNCA persistir cálculos (se recalculan).
- Historial → array de periodos guardados explícitamente.

## Accessibility (WCAG 2.1 AA — RNF02)

- Todo input tiene `<label>` asociado (`htmlFor`).
- Navegación completa por teclado. `tabIndex` solo si es necesario; prefiere orden DOM natural.
- Contraste ≥ 4.5:1 para texto.
- `prefers-reduced-motion` respetado (pausa animaciones).
- Recharts: añade `role="img"` y `aria-label` en gráficos.

## Responsive (RNF03)

Breakpoints: 320 / 640 / 768 / 1024 / 1280. Mobile-first. La tabla de registro semanal DEBE ser usable en 320px (considera stack vertical por día en móvil).

## Antes de cerrar un componente

- [ ] `pnpm lint` pasa.
- [ ] `pnpm check-types` pasa.
- [ ] Existe `Componente.test.tsx` con al menos un test de render + uno de comportamiento.
- [ ] Etiquetas ARIA/labels presentes.
- [ ] Se renderiza en móvil (320px) sin scroll horizontal.