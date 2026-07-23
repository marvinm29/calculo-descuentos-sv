# Plan de Rediseño — Jornada, Horas Extra e Incentivos (Sprint 10)

> **Estado**: Aprobado por el usuario (2026-07-22). Pendiente de ejecución en Build mode.
> **Origen**: Audit de bugs 2026-07-22 — el modelo día-por-día con bloques horarios
> causó directamente los bugs #3, #4, #5 y #6. Se reemplaza por completo.

## 0. Base legal verificada (fuentes consultadas 2026-07-22)

| Regla | Fuente | Valor |
|---|---|---|
| Recargo nocturnidad hora ordinaria | MTPS 2021 ("¿Cuándo mi jornada es nocturna…") + Art. 168 CT | **+25%** → `salarioHora × 1.25` (ej. MTPS: $1.04 + $0.26 = $1.30) |
| Extra nocturna | misalariosv.com/horas-extra (criterio RF03) + Art. 168+169 CT | **2.25x** (mantener; el MTPS 2025 muestra aritmética inconsistente ~$3.74 ≈ 2.49x — se documenta la discrepancia, no se adopta) |
| Jornada nocturna | Art. 161 CT | **7h/día, 39h/semana** (el artículo MTPS 2021 dice "29 horas semanales" — typo confirmado, no adoptar) |
| Jornada diurna | Art. 161 CT | 8h/día, 44h/semana |
| Factores extra / día libre / asueto | misalariosv + `specs/tasas-legales.md` | 2.00 / 2.25 / 1.50 / 1.75 / 2.00 (**sin cambios**) |
| Incentivos habituales (bonos/comisiones) | Doctrina ISSS/AFP/LISR | Son salario: cotizan y gravan → **default del checkbox: sujeto a descuentos** |

**Semántica de la constante de nocturnidad**: el valor actual
`HORAS_EXTRA.NOCTURNIDAD: 1.25` es el **multiplicador de pago total** (ya incluye
el 25%). En el rediseño la fuente pasa a ser `RECARGO_NOCTURNIDAD: 0.25`
(el recargo puro) y el multiplicador se deriva como `1 + RECARGO_NOCTURNIDAD`.

## 1. Decisiones de producto (confirmadas por el usuario)

1. **Recargo de nocturnidad**: se aplica sobre las horas base nocturnas
   ingresadas, como línea visible separada (lectura estricta Art. 168).
2. **Jornada personalizada que excede el máximo legal** (44h diurna / 39h
   nocturna): el exceso se **auto-convierte en hora extra** pagada
   (2.00x diurna / 2.25x nocturna según modalidad), con nota visible en UI.
3. **Granularidad**: las horas extra se ingresan **por semana** (buckets sin
   fechas ni navegación), siempre separadas de la jornada base, sin mínimo —
   incluso 1h se calcula y paga con su recargo.
4. **Incentivos** (bonificaciones, comisiones): nuevo field, lista de ítems
   con checkbox "aplica descuentos de ley" **default ✓ (sujeto a descuentos)**.
5. **NO** agregar opción "tiempo parcial": el CT no define número fijo;
   "Personalizado" ya cubre ese caso.

## 2. Modelo de datos

```typescript
// packages/shared/src/types.ts
export type ModalidadJornada = 'diurna' | 'nocturna';

export interface JornadaConfig {
  tipo: 'tiempo_completo' | 'personalizado';  // 44h fijo | input libre
  horasSemanales: number;
  modalidad: ModalidadJornada;
}

export interface SemanaRegistro {   // bucket SIN fechas ni semanaId
  horasBaseNocturnas: number;       // → recargo 25%
  extraDiurna: number;
  extraNocturna: number;
  diaLibreDiurna: number;
  diaLibreNocturna: number;
  asueto: number;
}

export interface Incentivo {
  id: string;
  concepto: string;                 // "Bono", "Comisión", etc.
  monto: number;                    // USD
  aplicaDescuentos: boolean;        // default TRUE
}

// Contrato API — solo aditivo, backward-compatible
// CalcularRequest += { horasBaseNocturnas?: number; incentivos?: Incentivo[] }
// BrutoResponse  += { recargoNocturnidad: number; incentivos: number; incentivosGravados: number }
```

## 3. Reglas de cálculo (packages/shared)

1. `recargoNocturnidad = Σ horasBaseNocturnas × salarioHora × 0.25` — línea
   visible "Recargo nocturnidad (Art. 168)".
2. **Auto-conversión**: `exceso = max(0, horasSemanales − (44|39))` × nº de
   semanas → `extraDiurna` (2.00x) o `extraNocturna` (2.25x) según modalidad.
3. `brutoGravable = salarioBasePeriodo + extras + recargo + Σ incentivos(aplicaDescuentos)`
   → ISSS/AFP/Renta sobre esto (topes existentes sin cambio).
4. `brutoTotal = brutoGravable + Σ incentivos(no gravados)`.
5. `neto = brutoTotal − totalDescuentos`.
6. El frontend genera `segmentos` sintéticos (fechas artificiales
   `fechaInicio + 7×i`) → **API y BD sin cambios estructurales**.
7. Extras **sin mínimo**: 1h sola se calcula y paga; nunca se absorbe a la
   base ni se descarta.
8. `salarioHora = mensual / 30 / 8` universal (consistencia con misalariosv).
9. `fechaInicio`/`fechaFin` del request = fecha de hoy (solo alimentan el
   aguinaldo proporcional); ya no existe calendario real.

## 4. Archivos

### packages/shared (lógica)

| Archivo | Acción | Detalle |
|---|---|---|
| `tasas.ts` | Modificar | `RECARGO_NOCTURNIDAD: 0.25` explícito (fuente del multiplicador); `JORNADA = { DIURNA_SEMANAL: 44, NOCTURNA_SEMANAL: 39, DIURNA_DIARIA: 8, NOCTURNA_DIARIA: 7 }` |
| `types.ts` | Modificar | Tipos nuevos (§2) + campos aditivos en Request/Response |
| `schemas.ts` | Modificar | Espejo Zod de campos opcionales nuevos |
| `calc/horasExtra.ts` | Modificar | Recargo real sobre horas base nocturnas (mata el código muerto de `salarioHoraNocturna`) |
| `calc/calcular.ts` | Modificar | Orquesta reglas 1–5 |

### apps/web — eliminar

`components/registroTypes.ts`, `FilaDia.tsx`, `TotalesSemana.tsx`,
`ResumenSemanalVisual.tsx`, `RegistroSemanal.tsx`, `hooks/useRegistroSemanal.ts`
(+ sus 3 archivos de test).

### apps/web — crear

| Archivo | Detalle |
|---|---|
| `components/JornadaSelector.tsx` | Tiempo completo (44h) / personalizado (input) + modalidad diurna/nocturna |
| `components/SemanaExtrasCard.tsx` | Bucket semanal: 6 inputs numéricos (base nocturnas + 5 tipos extra), add/remove semana |
| `components/IncentivosForm.tsx` | Lista: concepto + monto + checkbox "Aplica descuentos de ley" (✓ default) |
| `components/TotalesPeriodo.tsx` | Resumen simple de totales (sin Recharts, sin navegación) |
| `lib/migrarRegistro.ts` | Migración best-effort del localStorage viejo |

### apps/web — modificar

| Archivo | Detalle |
|---|---|
| `context/AppContext.tsx` | Slices `jornada` + `registroPeriodo` (keys nuevas, sin colisión) |
| `hooks/useCalculos.ts` | Reescrito: request desde el modelo nuevo (**mata bug #6**) |
| `components/HistorialPeriodos.tsx` | **Fix bug #1** (request real, no hardcodeado) + render tolerante a filas viejas sin campos nuevos |
| `components/ResumenBruto.tsx` | Líneas nuevas: Incentivos, Recargo nocturnidad (si > 0) |
| `components/GuiaCalculos.tsx` | Explicar recargo 25% (ejemplo MTPS $1.04→$1.30) + incentivos |
| `App.tsx` | Slot `RegistroSemanal` → `JornadaSelector` + `SemanaExtrasCard` + `IncentivosForm` |

### apps/api

Sin cambios estructurales. Hereda los campos opcionales vía schemas de
`@calc/shared`. Tests nuevos para los campos opcionales.

### Documentación (mismo commit — regla AGENTS.md)

`specs/tasas-legales.md` (+recargo explícito, +discrepancia MTPS, +incentivos),
`specs/requirements.md` (RF02 reescrito al modelo nuevo), `specs/architecture.md`
(diagrama de componentes), `specs/sprints.md` (entrada Sprint 10), `AGENTS.md`
(quirks del registro viejo quedan obsoletos).

## 5. Migración de datos existentes

- **`localStorage['registro-semanal']`**: best-effort — cada `semanaId` viejo →
  un `SemanaRegistro` (solo bloques `extra_*` se rescatan; el resto era base,
  no recuperable — los datos viejos ya eran sospechosos por bugs #3/#5);
  corrupto → bucket vacío; luego **borrar la key vieja**. `incentivos: []`.
- **SQLite `calculation_history`**: **sin migración**. Filas viejas sin campos
  nuevos → el frontend renderiza $0.00 (default defensivo).
- **Keys nuevas**: `jornada-config`, `registro-periodo`.

## 6. Tests

### Obsoletos (se eliminan con sus componentes)

- `FilaDia.test.tsx` (3), `TotalesSemana.test.tsx` (3), `RegistroSemanal.test.tsx` (4)
- `horasExtra.test.ts`: el test "la jornada nocturna incluye 25% de
  nocturnidad" hoy prueba la función muerta → se reescribe contra el path real
- Fixtures de `calcular.test.ts` (shared y api) se actualizan por los campos
  nuevos en `BrutoResponse`

### Nuevos

- **Auto-conversión**: 48h diurna → 4h/sem extra 2.00x; 42h nocturna → 3h/sem
  extra 2.25x; 44h exactas → 0 exceso
- **Recargo nocturnidad**: 39h nocturnas, salario $800 →
  `39 × 3.33 × 0.25 ≈ $32.50` (trazable al ejemplo MTPS $1.04→$1.30)
- **Incentivos**: gravados vs no gravados (mixto), default checkbox ✓, tope
  ISSS con incentivo alto, neto = brutoTotal − descuentos
- **1h extra sola**: sin mínimo, nunca absorbida por la base ni descartada
- **Agregación multi-semana**: Sem1 (2h extra D) + Sem2 (3h extra N) → totales
- **Migración**: viejo → nuevo; JSON corrupto → defaults; key ausente → defaults
- **API**: request sin campos opcionales → 200 OK (Supertest)
- **Historial**: guardar envía el request REAL (regresión bug #1); fila vieja
  sin campos nuevos → renderiza $0.00
- **Cruce de medianoche** (bug #2): **imposible por diseño** — sin
  time-pickers no existe el cómputo `fin <= inicio → 0`. Documentado en test
  de migración.

**Gate final obligatorio**: `pnpm lint && pnpm check-types && pnpm test`
+ coverage > 80%.

## 7. Bugs del audit que este plan mata

| Bug | Cómo se resuelve |
|---|---|
| #1 Request hardcodeado en historial | Fix explícito en `HistorialPeriodos` |
| #2 Cruce de medianoche computa 0h | Eliminado por diseño (sin bloques horarios) |
| #3 Jornada base no seleccionable | Modelo nuevo con modalidad explícita |
| #4 Recargo nocturnidad nunca aplicado | Regla de cálculo §3.1 + línea visible |
| #5 Corrupción de datos entre semanas | Buckets sin fechas ni navegación |
| #6 Cálculo con semana arbitraria | `useCalculos` consume el modelo nuevo directo |
| #10 Cap nocturno 8h (legal: 7h) | `JORNADA.NOCTURNA_DIARIA: 7` en auto-conversión |
