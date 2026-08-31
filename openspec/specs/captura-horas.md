# Spec: Captura de Horas

> Verdad actual congelada del Sprint 10b (2026-07-23) — **reemplaza** al modelo semanal de 10a.
> Fuente de comportamiento: `apps/web/src/context/AppContext.tsx`, `apps/web/src/hooks/useCalculos.ts`,
> `apps/web/src/components/{EntradasPeriodo,JornadaSelector,IncentivosForm}.tsx`.

## Modelo de entrada

- **`EntradaPeriodo[]`** (key localStorage `entradas-periodo`): lista plana por fecha.
  Cada entrada: `{ id, fecha: 'YYYY-MM-DD', tipo: 'extra'|'dia_libre'|'asueto', horasDiurnas, horasNocturnas }`.
- **No hay navegación entre semanas** ni `Map<semanaId>`. Es una lista que se agrega/elimina.
- **Sin time-pickers**: inputs numéricos puros (elimina por diseño el bug de cruce de medianoche).
- Entradas con `horasDiurnas = 0` y `horasNocturnas = 0` se descartan en la conversión.

## `JornadaConfig`

- `{ modalidad: 'diurna' | 'nocturna' }` (key `jornada-config`).
- **Solo `modalidad`** alimenta el motor: la heurística de nocturnidad. No hay `tipo` ni
  `horasSemanales` (residuo del modelo 10a, **eliminado** el 2026-08-30). No existe promesa
  de auto-conversión de exceso: las horas se ingresan explícitamente como entradas.

## Derivación de `horasBaseNocturnas`

- **Heurística, no input**: si `modalidad === 'nocturna'`, se cuentan fechas únicas en `entradas` y se multiplica por `JORNADA.NOCTURNA_DIARIA (7)`. Nunca se pregunta al usuario.

## Conversión a segmentos

`entradasASegmentos(entradas, jornada)` produce:

- `extra` → `extra_diurna` y/o `extra_nocturna` según horas.
- `dia_libre` → `dia_libre_diurna` y/o `dia_libre_nocturna`.
- `asueto` → un solo segmento `asueto` con `horas = horasDiurnas + horasNocturnas` (factor 2.00 no distingue modalidad).
- Devuelve también `horasBaseNocturnas` derivado.

## Cálculo a la carta

- Con `salarioBase > 0` y **cero entradas**, `useCalculos` retorna `success` con solo el salario base.
- Puedes calcular N horas extras sin declarar semana alguna (ver Sprint 1 del plan: blindar con test explícito).

## Fechas

- `fechaInicio`/`fechaFin` del request = **hoy** (no hay calendario de periodo; solo alimentan aguinaldo proporcional).

## Modelo muerto (no usar)

- `SemanaRegistro`, `SemanaExtrasCard`, buckets semanales, `registro-periodo`/`registro-semanal`,
  `tipo`/`horasSemanales` de `JornadaConfig`: **eliminados**. `SemanaRegistro` fue removido de
  `@calc/shared` el 2026-08-30.

## ADRs relacionados

- `ADR-010` (captura día por día, 10b gana a 10a)