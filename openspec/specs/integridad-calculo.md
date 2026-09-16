# Spec: Integridad de Cálculo y API

> Estado: **VIGENTE** (2026-09-15). Especificación normativa — precede a la implementación.
> Complementa `contrato-calcular.md` (request/response) y `captura-horas.md` (modelo de captura).
> Cualquier cambio posterior requiere editar esta spec y las pruebas de aceptación en el mismo cambio.

## Motivación

El modelo actual permite que datos imposibles o manipulados produzcan cálculos con apariencia
válida: la regex ISO acepta `2026-02-30`, la API acepta segmentos fuera del período declarado,
más de 24 h acumuladas en una misma fecha, y colecciones sin límite. Además, el recargo de
nocturnidad regular (`horasBaseNocturnas`) se **infiere** de filas que sólo representan extras,
días libres o asuetos: una fila vacía o una fecha añadida puede aumentar el neto sin trabajo
regular declarado. Esta spec congela las reglas que cierran esas vías.

## Regla 1 — Fechas de calendario reales

Toda fecha (`fechaInicio`, `fechaFin`, `fechaIngreso`, `segmentos[].fecha`) debe ser:

1. Sintácticamente `YYYY-MM-DD` (regex `^\d{4}-\d{2}-\d{2}$`).
2. Una fecha de calendario real: mes 1–12, día válido para el mes y bisiesto.

`2026-02-30`, `2025-02-29` y `2026-13-01` son inválidos. La validación es agnóstica de zona
horaria (comparación de componentes Y/M/D, sin `new Date(string)` para validar).

## Regla 2 — Segmentos dentro del período

Para cada segmento: `fechaInicio <= segmentos[].fecha <= fechaFin` (inclusivo en ambos extremos).
Un segmento fuera del período se rechaza con `VALIDATION_ERROR` y `details[]` apuntando al índice.

## Regla 3 — Acumulado máximo de 24 h por fecha

La suma de `horas` de todos los segmentos que comparten la misma `fecha` no puede exceder 24.
Ejemplo: dos segmentos de 14 h el mismo día → rechazo, aunque cada uno individualmente sea ≤ 24.

## Regla 4 — Números finitos y no negativos

- `salarioBase`: finito, `> 0`, `<= 100000`.
- `segmentos[].horas`: finito, `>= 0`, `<= 24`.
- `incentivos[].monto`: finito, `>= 0` (sin máximo documentado; lo limita el salarioBase del bruto).
- `Infinity`, `-Infinity` y `NaN` se rechazan en todos los campos numéricos.

## Regla 5 — Período de máximo 31 días inclusivos

`fechaFin - fechaInicio <= 30 días calendario` (equivalente a **31 días inclusivos**).
Bordes de aceptación: diferencia 29 (30 inclusivos) y 30 (31 inclusivos). Diferencia 31
(32 inclusivos) se rechaza. Regla de negocio en `validarNegocio`, reportada como 400 con
`details[]` en `fechaFin`.

## Regla 6 — Máximo de colecciones

- `segmentos`: máximo **100** elementos.
- `incentivos`: máximo **50** elementos.
- `incentivos[].concepto`: 1–100 caracteres. `incentivos[].id`: 1–64 caracteres.

Los máximos son parte del contrato documentado (`api-contract.md`); la UI aplica los mismos
límites y nunca puede enviar una carga inválida.

## Regla 7 — Eliminación del recargo nocturno regular inferido

- Se elimina `horasBaseNocturnas` de: `CalcularRequest` (tipo y schema Zod), `calcular()`,
  `entradasASegmentos()`, la UI y toda la documentación vigente.
- Se elimina `recargoNocturnidad` de `BrutoResponse` y el helper `calcularRecargoNocturnidad`.
- Los factores de horas extra nocturnas (2.25×) y día libre nocturno (1.75×) **permanecen**
  (`HORAS_EXTRA` en `tasas.ts`): son recargos sobre horas explícitamente capturadas; no hay
  doble recargo sobre las mismas horas.
- `JornadaConfig.modalidad` se conserva con propósito informativo en la UI; ya no alimenta
  ninguna heurística del motor.
- La reintroducción de recargo nocturno regular requiere captura explícita de horas regulares
  y una nueva spec jurídicamente validada.

## Regla 8 — Persistencia local validada

`localStorage` nunca se consume como `T` por cast directo:

1. Todo valor leído se valida contra un parser (Zod) de su clave; si no cumple la forma → la
   clave se elimina y se usa el default.
2. Claves muertas (`registro-periodo`, `registro-semanal`, legado de Clerk/historial remoto)
   se eliminan explícitamente al cargar la app (migración de limpieza).
3. Cuando se descarta información corrupta, la UI muestra un aviso no bloqueante indicando
   qué datos se restablecieron.
4. Datos corruptos no producen nunca `NaN` ni estados de cálculo inválidos: los defaults son
   valores seguros.

## Regla 9 — CORS y proxy

- CORS existe **sólo en Express**: origen configurable por `CORS_ORIGIN` (lista separada por
  comas), default `http://localhost:5173`. Ningún componente de borde (Caddy) añade headers CORS.
- Express confía en un número limitado de saltos de proxy (`TRUST_PROXY`, default `0` = no
  confiar; producción Caddy→Express local = `1`).
- El rate limiter (100 req/min) debe contabilizar por IP real de cliente cuando hay proxy,
  de modo que no se comparta un solo bucket para todos los usuarios.

## Regla 10 — Errores sin filtración

Los errores no controlados responden `500 INTERNAL_ERROR` con mensaje fijo, sin stack, sin
detalles internos; los detalles van sólo al log del servidor.

## Aceptación

- Pruebas compartidas: calendario válido/inválido (28/29/30/31, bisiesto), rangos inclusivos
  30/31/32 días, segmento fuera de período, acumulado diario > 24, límites de colecciones,
  ausencia total de recargo nocturno inferido.
- Pruebas API: 400 con `details[]` precisos, CORS restringido (origen permitido/no permitido),
  rate limit diferenciado por `X-Forwarded-For` con `TRUST_PROXY=1`, 500 sin filtración.
- Pruebas web: filas vacías no alteran el resultado, entradas inválidas muestran feedback y no
  se persisten, migración de localStorage corrupto con aviso, regresión de factores nocturnos
  (2.25× / 1.75× intactos, recargo inferido = 0 siempre).
