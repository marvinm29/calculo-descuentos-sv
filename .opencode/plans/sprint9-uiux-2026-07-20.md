# Sprint 9 — UI/UX: Dark/light mode, mejora visual, vista día por día

**Fecha**: 2026-07-20

## Resumen

Sprint enfocado en UX: unificar caracteres españoles, implementar dark/light mode con toggle, mejorar diseño visual y agregar vista día por día.

---

## Tareas

### 1. Unificar caracteres españoles
- Reemplazar todas las HTML entities (`&oacute;`, `&ntilde;`, `&uuml;`, etc.) por UTF-8 plano
- Consistencia: usar á, é, í, ó, ú, ñ, ü directamente en JSX
- React escapa automáticamente, no hay riesgo de seguridad
- Archivos afectados: `ConfigInicial.tsx`, `ResultadoNeto.tsx`, `GraficoPastel.tsx`, `TablaTasas.tsx`, `Prestaciones.tsx`, `NetoLiquido.tsx`, `ResumenBruto.tsx`, `ExportarPDF.tsx`

### 2. Dark/light mode
- Agregar `@custom-variant dark (&:where(.dark, .dark *))` en `index.css`
- Hook `useTheme()` con persistencia en localStorage
- Toggle button en header con icono sol/luna
- Reemplazar colores hardcodeados con `dark:` variants en todos los componentes

### 3. Mejora visual (frontend-design skill)
- Paleta de colores mejorada en `@theme`
- Cards con `shadow-md`, bordes redondeados más grandes (`rounded-xl`)
- Animaciones suaves en hover/focus
- Mejor tipografía y espaciado
- Componentes más pulidos visualmente

### 4. Vista día por día
- Toggle `Vista semanal / Vista día` en `RegistroSemanal`
- Modo día: selector de fecha + inputs para un solo día
- Misma estructura `DiaRegistro[]`, solo cambia UX

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/index.css` | `@custom-variant dark`, paleta `@theme`, transiciones |
| `apps/web/src/App.tsx` | Dark mode class en html, toggle en header |
| `apps/web/src/hooks/useTheme.ts` | Nuevo hook |
| `apps/web/src/components/RegistroSemanal.tsx` | Toggle semanal/diario, selector fecha |
| `apps/web/src/components/*.tsx` | Unificar UTF-8, dark: variants |

---

## Verificación

```bash
pnpm lint && pnpm check-types && pnpm test
```
