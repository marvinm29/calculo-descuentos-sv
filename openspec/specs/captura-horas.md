# Spec: Captura de Horas

> Verdad actual congelada del Sprint 10b (2026-07-23) — **reemplaza** al modelo semanal de 10a.
> **Actualizada 2026-09-15**: eliminada la derivación de `horasBaseNocturnas` (Regla 7 de
> `integridad-calculo.md`). Fuente de comportamiento: `apps/web/src/context/AppContext.tsx`,
> `apps/web/src/hooks/useCalculos.ts`,
> `apps/web/src/components/{EntradasPeriodo,JornadaSelector,IncentivosForm}.tsx`.

## Modelo de entrada

- **`EntradaPeriodo[]`** (key localStorage `entradas-periodo`): lista plana por fecha.
  Cada entrada: `{ id, fecha: 'YYYY-MM-DD', tipo: 'extra'|'dia_libre'|'asueto', horasDiurnas, horasNocturnas }`.
- **No hay navegación entre semanas** ni `Map<semanaId>`. Es una lista que se agrega/elimina.
- **Sin time-pickers**: inputs numéricos puros (elimina por diseño el bug de cruce de medianoche).
- Entradas con `horasDiurnas = 0` y `horasNocturnas = 0` se descartan en la conversión.

## `JornadaConfig`

- `{ modalidad: 'diurna' | 'nocturna' }` (key `jornada-config`).
- **Solo informativo en la UI**: ya no alimenta ninguna heurística del motor (2026-09-15).
  Las horas extra nocturnas usan su factor 2.25× explícito; no hay recargo inferido.

## Conversión a segmentos

`entradasASegmentos(entradas)` produce:

- `extra` → `extra_diurna` y/o `extra_nocturna` según horas.
- `dia_libre` → `dia_libre_diurna` y/o `dia_libre_nocturna`.
- `asueto` → un solo segmento `asueto` con `horas = horasDiurnas + horasNocturnas` (factor 2.00 no distingue modalidad).
- Entradas con fecha inválida se descartan; no genera ningún segmento `regular_*`.

## Cálculo a la carta

- Con `salarioBase > 0` y **cero entradas**, `useCalculos` retorna `success` con solo el salario base.
- Puedes calcular N horas extras sin declarar semana alguna (ver Sprint 1 del plan: blindar con test explícito).

## Fechas

- El período del request se **deriva**: `fechaInicio = min(fechas de entradas ∪ {hoy})`,
  `fechaFin = max(fechas de entradas ∪ {hoy})`. Un período capturado que exceda 31 días
  inclusivos produce estado de error visible en la UI (Regla 5 de integridad).
- La UI valida las mismas reglas que el contrato (`calcularRequestSchema`): fecha real,
  horas 0–24, suma diaria ≤ 24 h; las filas inválidas muestran feedback y no alimentan el cálculo.

## Modelo muerto (no usar)

- `SemanaRegistro`, `SemanaExtrasCard`, buckets semanales, `registro-periodo`/`registro-semanal`,
  `tipo`/`horasSemanales` de `JornadaConfig`: **eliminados**. `SemanaRegistro` fue removido de
  `@calc/shared` el 2026-08-30.

## ADRs relacionados

- `ADR-010` (captura día por día, 10b gana a 10a)