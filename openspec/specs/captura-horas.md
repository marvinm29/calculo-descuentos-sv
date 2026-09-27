# Spec: Captura de Horas

> Verdad actual congelada del Sprint 10b (2026-07-23) — **reemplaza** al modelo semanal de 10a.
> **Actualizada 2026-09-15**: eliminada la derivación de `horasBaseNocturnas` (Regla 7 de
> `integridad-calculo.md`). **Actualizada 2026-09-27**: retirada la modalidad de jornada
> (`JornadaConfig`/`JornadaSelector`) por no aportar nada al cálculo. Fuente de comportamiento:
> `apps/web/src/context/AppContext.tsx`, `apps/web/src/hooks/useCalculos.ts`,
> `apps/web/src/components/{EntradasPeriodo,IncentivosForm}.tsx`.

## Modelo de entrada

- **`EntradaPeriodo[]`** (key localStorage `entradas-periodo`): lista plana por fecha.
  Cada entrada: `{ id, fecha: 'YYYY-MM-DD', tipo: 'extra'|'dia_libre'|'asueto', horasDiurnas, horasNocturnas }`.
- **No hay navegación entre semanas** ni `Map<semanaId>`. Es una lista que se agrega/elimina.
- **Sin time-pickers**: inputs numéricos puros (elimina por diseño el bug de cruce de medianoche).
- Entradas con `horasDiurnas = 0` y `horasNocturnas = 0` se descartan en la conversión.

## `JornadaConfig` (retirado 2026-09-27)

- `{ modalidad: 'diurna' | 'nocturna' }` (key `jornada-config`) **ya no se captura**: la UI no
  muestra selector ni nota y `AppContext` no expone `jornada`/`setJornada`.
- Motivo: no alimentaba ninguna heurística del motor desde 2026-09-15 (Regla 7); solo persistía y
  mostraba un valor. La nocturnidad entra por los factores explícitos 2.25×/1.75× de los segmentos.
- La clave `jornada-config` se agrega a `CLAVES_MUERTAS`: se elimina del navegador al cargar.
- `JornadaConfig`, `ModalidadJornada` y `modalidadJornadaSchema`/`jornadaConfigSchema` se
  **eliminaron** de `@calc/shared` el 2026-09-27 por no tener consumidor.

## Conversión a segmentos

`entradasASegmentos(entradas)` produce:

- `extra` → `extra_diurna` y/o `extra_nocturna` según horas.
- `dia_libre` → `dia_libre_diurna` y/o `dia_libre_nocturna`.
- `asueto` → un solo segmento `asueto` con `horas = horasDiurnas + horasNocturnas` (factor 2.00 no distingue modalidad).
- Entradas con fecha inválida se descartan; no genera ningún segmento `regular_*`.

### Límite por segmentos proyectados (FE-03)

Una fila con `horasDiurnas > 0` y `horasNocturnas > 0` (tipos `extra` y `dia_libre`) proyecta
**dos** segmentos. La UI aplica el límite de `MAX_SEGMENTOS` (100) sobre la **proyección** de
segmentos, no sobre el número de filas: el botón de agregar fila se deshabilita cuando la
proyección total alcanza el límite y la UI muestra cuántos segmentos se enviarían. Esto garantiza
que ninguna captura aceptada por la UI pueda ser rechazada por el API por exceso de segmentos.

**Cobertura del límite en la edición (2026-09-20)**: el límite también se aplica al **estado
candidato** de una fila existente antes de llamar a `onChange`. Si editar una fila (p. ej.
cambiar `asueto` → `extra` con horas diurnas y nocturnas, o escribir la segunda franja de una
fila mixta) haría exceder 100 segmentos proyectados, el cambio no se aplica: la fila conserva
sus valores y la UI muestra un aviso no bloqueante (`role="alert"`) que indica el límite. El
usuario reduce horas, cambia el tipo o elimina filas para liberar margen. Pruebas de regresión:
99 → 100 segmentos (agregar/editar permitido), 100 → 101 por edición (bloqueado), filas mixtas,
asuetos y fechas inválidas.

### Validación numérica en la UI (Regla 4 en cliente)

`validarFila` y `validarIncentivo` reflejan las reglas compartidas **antes** de que el valor
llegue al cálculo: rechazan `NaN`, `Infinity` y `-Infinity` (número no finito), negativos y
valores fuera de rango (horas > 24; `monto` negativo; concepto > 100 caracteres). El error es
inline, asociado a los campos causantes (`aria-invalid` + `aria-describedby`) y con
`role="alert"`; la fila inválida no alimenta el cálculo. La UI no debe delegar en el
`calcularRequestSchema` la detección de estos valores para mostrar después un error genérico:
la validación ocurre en el mismo evento de edición.

## Incentivos en la UI (FE-04)

- Máximo `MAX_INCENTIVOS` (50) filas: el botón de agregar se deshabilita al llegar al límite.
- Una fila con monto `> 0` y concepto en blanco (o solo espacios) muestra error inline junto al
  campo `concepto` (`aria-invalid` + `aria-describedby`) y no debe enviarse al cálculo parcial:
  el usuario la completa o la elimina. La fila totalmente vacía (sin concepto y sin monto) sigue
  omitiéndose (comportamiento vigente).
- Los errores de fila se anuncian con `role="alert"` y se asocian a los campos que los causan.

## Cálculo a la carta

- Con `salarioBase > 0` y **cero entradas**, `useCalculos` retorna `success` con solo el salario base.
- Puedes calcular N horas extras sin declarar semana alguna (ver Sprint 1 del plan: blindar con test explícito).

## Fechas

- El período del request se **deriva** de las fechas de entradas válidas: `fechaInicio = min(fechas)`
  y `fechaFin = max(fechas)`. Si no existen entradas válidas, ambos extremos usan `hoy` local.
  No se mezcla `hoy` con fechas históricas, porque eso puede ampliar artificialmente el periodo
  (FE-01 del plan frontend). Un período capturado que exceda 31 días inclusivos produce estado de
  error visible en la UI (Regla 5 de integridad).
- **Fecha local, nunca UTC** (FE-14): `hoy` y la fecha por defecto de una fila nueva se obtienen
  de un helper de fecha local (componentes Y/M/D de la zona del dispositivo). `toISOString()`
  devuelve UTC y está prohibido para fechas de negocio: cerca de medianoche en El Salvador puede
  cambiar el día observado.
- **Periodo histórico exige fecha de ingreso** (2026-09-20): si el periodo derivado termina
  antes de `hoy` (`fechaFin < hoy`) y `fechaIngreso` está vacío, la UI no sustituye la fecha de
  ingreso por `hoy`: eso fabricaría `fechaIngreso > fechaFin` y un error genérico del schema, y
  un ingreso supuesto "hoy" no representa una relación laboral histórica. En su lugar el cálculo
  entra en estado de error con un mensaje accionable que pide definir la fecha de ingreso en
  Configuración. No se deriva ninguna semántica legal adicional (p. ej. asumir la primera fecha
  del periodo como ingreso): esa interpretación no tiene fuente normativa y queda fuera de
  alcance. Rollback: restaurar la sustitución `fechaIngreso || hoy` y esta regla.
- La UI valida las mismas reglas que el contrato (`calcularRequestSchema`): fecha real,
  horas 0–24, suma diaria ≤ 24 h; las filas inválidas muestran feedback y no alimentan el cálculo.

## Jornada en la UI (FE-17 — retirada 2026-09-27)

La sección "Jornada" y su nota informativa se **eliminaron**: no resolvían ningún problema (no
alimentaban el cálculo, no se enviaban al API). Prueba de regresión: `App.test.tsx` verifica que la
sección no se renderiza y que `jornada-config` se limpia. Ver `JornadaConfig (retirado)` arriba.

## Modelo muerto (no usar)

- `SemanaRegistro`, `SemanaExtrasCard`, buckets semanales, `registro-periodo`/`registro-semanal`,
  `tipo`/`horasSemanales` de `JornadaConfig`: **eliminados**. `SemanaRegistro` fue removido de
  `@calc/shared` el 2026-08-30. `JornadaConfig` (modalidad) y la clave `jornada-config`:
  **retirados de la web** el 2026-09-27.

## ADRs relacionados

- `ADR-010` (captura día por día, 10b gana a 10a)
