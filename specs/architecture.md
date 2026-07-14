# Arquitectura - Calculadora de Descuentos SV

> Basado en SWEBOK Chapter 2: Software Design
> Architecture Decision Records (ADR) documentan las decisiones clave.

## Diagrama de Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│                    Cliente (Navegador)                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │              React 19 SPA (Vite 8)                  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │  │
│  │  │ Registro │ │ Cálculos │ │   Resultados     │   │  │
│  │  │ Semanal  │ │ Locales  │ │   + Gráficos     │   │  │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │  │
│  │         │              │              │            │  │
│  │         ▼              ▼              ▼            │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │        localStorage (persistencia)           │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────┘  │
│                           │                               │
│                    POST /api/calcular                     │
│               (solo validación server-side)               │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTPS
┌───────────────────────────┴──────────────────────────────┐
│                    Render.com (Node.js 22)                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Express 5 API                          │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │  │
│  │  │ Routes   │→│ Services │→│   Constants      │   │  │
│  │  │ (thin)   │ │ (logic)  │ │ (tasas legales)  │   │  │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Decisiones de Arquitectura (ADR)

### ADR-001: Lógica de cálculo duplicada en frontend y backend

**Estado**: Aceptado
**Fecha**: 2026-07-13

**Contexto**: La aplicacion necesita calcular descuentos de ley salvadorenos.
El backend existe para validacion y como source of truth.

**Decisión**: La logica de calculo existe tanto en el frontend
(`apps/web/src/utils/`) como en el backend (`apps/api/src/services/`).
Las constantes compartidas viven en `packages/shared/src/`.

**Razón**: Permite modo offline en el frontend. El backend sirve como
validador de referencia. Los usuarios pueden usar la calculadora sin conexion.

**Consecuencias**:
- Las tasas y formulas deben mantenerse sincronizadas entre frontend y backend.
- Las constantes en `packages/shared` son la unica fuente de verdad para tasas.
- Cualquier cambio en tasas requiere actualizar `packages/shared/src/tasas.ts`.

### ADR-002: Monorepo con Turborepo + pnpm workspaces

**Estado**: Aceptado
**Fecha**: 2026-07-13

**Contexto**: El proyecto tiene 2 aplicaciones (web, api) y 2 paquetes
compartidos (shared, config). Necesitamos tooling para gestionarlos.

**Decisión**: Usar Turborepo con pnpm workspaces.

**Alternativas consideradas**:
- **Nx**: Demasiado complejo para 4 paquetes. Sobrecarga de configuracion.
- **npm workspaces solo**: Sin caching ni paralelismo de tareas.
- **Yarn workspaces**: Similar a pnpm pero pnpm es mas rapido y estricto.

**Razón**: Turborepo ofrece caching local y paralelismo con minima configuracion.
pnpm es el package manager mas rapido y estricto (previene phantom dependencies).

### ADR-003: Sin base de datos

**Estado**: Aceptado
**Fecha**: 2026-07-13

**Contexto**: La aplicacion es una calculadora de descuentos que no requiere
cuentas de usuario ni datos compartidos.

**Decisión**: No usar base de datos. Persistencia solo en localStorage del cliente.

**Razón**: El usuario final especifico "solo calculadora al vuelo". Los datos
pertenecen al usuario. Simplifica el deploy (sin servicio de BD que mantener).

**Consecuencias**:
- No hay cuentas de usuario ni datos compartidos entre dispositivos.
- El backend es stateless y solo realiza calculos/validaciones.
- Si en el futuro se requieren cuentas, se puede agregar SQLite/Postgres.

### ADR-004: TailwindCSS v4 para estilos

**Estado**: Aceptado
**Fecha**: 2026-07-13

**Contexto**: Necesitamos un sistema de estilos para la interfaz React.

**Decisión**: TailwindCSS v4 con CSS-first configuration.

**Alternativas consideradas**:
- **CSS Modules**: Mas boilerplate, requiere naming convention manual.
- **styled-components**: Runtime CSS-in-JS, overhead innecesario.
- **Vanilla CSS**: Dificil de mantener en proyectos que crecen.

**Razón**: Utility-first, rapido de desarrollar, excelente DX. Tailwind v4
usa configuracion via CSS en lugar de JS, mas simple. Bueno para AI-driven
development por clases predecibles y documentadas.

### ADR-005: API única POST /api/calcular

**Estado**: Aceptado
**Fecha**: 2026-07-13

**Contexto**: El backend necesita exponer la funcionalidad de calculo.

**Decisión**: Una sola ruta POST que recibe los datos del periodo y
devuelve todos los calculos en una respuesta.

**Razón**: La calculadora es una operacion de "transformacion de datos"
pura (input -> calculo -> output). No hay recursos persistentes que
justifiquen multiples endpoints REST. Mantiene el backend simple.

**Consecuencias**:
- Simple de implementar y testear.
- No es RESTful puro, pero adecuado para el caso de uso.
- Si se agregan funcionalidades (guardar, compartir), se pueden agregar rutas.

## Patrones de Diseño Aplicados

| Patron | Descripcion | Donde se aplica |
|--------|-------------|-----------------|
| **Feature-based** | Agrupar por funcionalidad, no por tipo de archivo | Frontend y backend |
| **Custom Hooks** | Encapsular logica de estado y efectos | React: `useRegistroSemanal`, `useCalculoDescuentos` |
| **Service Layer** | Separar logica de negocio del transporte HTTP | Backend: `services/horas.ts`, `services/descuentos.ts` |
| **Error Boundary** | Capturar errores de renderizado sin romper la UI | React: `<ErrorBoundary>` |
| **Middleware Chain** | Procesar requests en cadena | Express: CORS, Zod validation, rate limiting, error handler |
| **Repository** | (Futuro) Abstraer acceso a datos | Si se agrega BD en el futuro |

## Diagrama de Componentes Frontend

```
App.tsx
├── ConfigInicial.tsx
│   └── Input: salario base, tipo pago, antigüedad
├── RegistroSemanal.tsx
│   ├── SelectorSemana.tsx         ← Navegación entre semanas
│   ├── FilaDia.tsx (x7)           ← Una fila por día (Lun-Dom)
│   │   └── SelectorTipoHora.tsx   ← Dropdown de tipo de jornada
│   └── TotalesSemana.tsx          ← Suma semanal en tiempo real
├── ResultadoNeto.tsx
│   ├── ResumenBruto.tsx           ← Desglose del salario bruto
│   ├── TablaDescuentos.tsx        ← ISSS, AFP, Renta detallados
│   ├── Prestaciones.tsx           ← Aguinaldo, vacaciones, Q25
│   └── NetoLiquido.tsx            ← Total neto destacado
├── GraficoPastel.tsx              ← Distribución salarial
├── TablaTasas.tsx                 ← Tasas vigentes + links .gob.sv
├── HistorialPeriodos.tsx          ← Lista de períodos guardados
└── ExportarPDF.tsx                ← Botón exportar/imprimir
```

## Diagrama de Componentes Backend

```
index.ts
├── app.ts                         ← Configuración Express
│   ├── CORS middleware
│   ├── JSON body parser
│   ├── Rate limiter
│   └── Routes
│       └── /api/
│           └── calcular.ts        ← POST /api/calcular
│               ├── Zod validation
│               ├── horas.service.ts
│               ├── descuentos.service.ts
│               └── prestaciones.service.ts
└── middleware/
    └── errorHandler.ts            ← Manejo centralizado de errores
```

## Estrategia de Estado en Frontend

```
┌─────────────────────────────────────────────────┐
│                  App State                        │
│  ┌─────────────┐  ┌──────────────────────────┐  │
│  │ ConfigInicial│  │    Registro Semanal       │  │
│  │ (localStorage)│  │    (localStorage)         │  │
│  │              │  │   Map<semanaId, Dia[]>    │  │
│  └──────┬───────┘  └───────────┬──────────────┘  │
│         │                      │                  │
│         └──────────┬───────────┘                  │
│                    ▼                              │
│         ┌──────────────────┐                     │
│         │   useCalculos()   │ ← Hook derivado     │
│         │  (memorizado)     │                     │
│         └──────────────────┘                     │
└─────────────────────────────────────────────────┘
```

- **Config**: Un solo objeto, persiste en localStorage
- **Registro semanal**: Map de semanas, cada semana es un array de 7 dias
- **Calculos**: Derivados de config + registro, memorizados con useMemo
- **Historial**: Array de periodos calculados guardados
