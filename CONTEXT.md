# CONTEXT.md — Calculadora de Descuentos de Ley SV

Vocabulario del dominio de una calculadora de descuentos legales salvadoreños
(ISSS, AFP, Renta, horas extra y prestaciones). Los nombres deben coincidir con `packages/shared/src/types.ts`.

## Cálculo

**salarioBase**:
Salario mensual bruto declarado por el usuario; punto de partida de todos los cálculos.
_Avoid_: salario, sueldo

**salarioHoraDiurna**:
`salarioBase / 30 / 8`. Unidad sobre la que se aplican los factores de horas extra; la nocturnidad ya viene incorporada en los factores 2.25×/1.75× (el recargo inferido de nocturnidad se retiró 2026-09-15).
_Avoid_: salario por hora

**segmento** (`SegmentoHorario`):
Una fecha + tipo de hora + horas. Es la unidad que el motor `calcular()` recibe y paga.
_Avoid_: bloque, bucket

**brutoGravable**:
`salarioBasePeriodo + pago de segmentos + incentivos gravados`.
Es la base sobre la que se calculan ISSS, AFP y Renta.
_Avoid_: bruto total

**brutoTotal**:
`brutoGravable + incentivos no gravados`. Es el total que ve el usuario antes de descuentos.

**salarioLiquido**:
`brutoTotal − totalDescuentos`. Es el monto neto que se muestra como resultado final.
_Avoid_: neto, salario neto

**incentivo**:
Bono o comisión con `aplicaDescuentos: boolean`. Si grava, cotiza (ISSS/AFP/Renta); si no, suma al `brutoTotal` sin cotizar.
_Avoid_: bono (cuando es específico de incentivo)

**prestaciones**:
Aguinaldo, vacaciones y Quincena 25. Son **informativas**: no entran al `salarioLiquido`; las paga el empleador por separado.

## Captura de horas

**entrada** (`EntradaPeriodo`):
Registro individual: fecha + tipo (`extra` | `dia_libre` | `asueto`) + horas diurnas/nocturnas. Lista plana, sin semanas.
_Avoid_: registro, semana, bucket

**jornada** (`JornadaConfig`) — **retirada 2026-09-27**:
La modalidad (`diurna` | `nocturna`) se capturaba solo como nota informativa y no alimentaba el
motor; se eliminó de la UI, de `AppContext` y de `@calc/shared`. La nocturnidad entra por los
factores explícitos 2.25×/1.75× de los segmentos.

**tipoPago**:
`mensual` (factor 1) o `quincenal` (factor 0.5, tablas y cuotas fijas divididas entre 2).

**antiguedad**:
Tramo de años de servicio (`menos_1` | `1_a_3` | `3_a_9` | `10_o_mas`) que determina los días de aguinaldo.

## Persistencia

**localStorage**:
Única forma de persistencia del producto. Keys: `config-inicial`, `entradas-periodo`, `incentivos`, `historial-periodos`, `theme-preference`. No hay base de datos (ADR-003). Toda lectura se valida con Zod antes de usarse (Regla 8 de integridad); datos corruptos → clave eliminada + default + aviso en UI. `jornada-config` es clave muerta (se elimina al cargar).

## Reglas no obvias

- Las prestaciones son informativas y se muestran sin signo "+" ni efecto sobre el neto.
- Los segmentos `regular_*` pagan 0: el salario base no se deriva de horas ordinarias.
- El API no se consume en runtime; calcula el cliente (offline-first, ADR-006).
- No hay autenticación: utilidad pública, historial 100% local (ADR-011).
- Contrato estricto: el request no acepta campos desconocidos y la UI aplica las mismas validaciones que el API.

## Estado de interfaz y documentación

- La dirección visual vigente es **Calculadora clara y calmada**: superficies sólidas, bordes
  legibles, jerarquía de contenido y una sola acción primaria por sección. No usar Liquid Glass,
  `.glass-*`, `backdrop-filter`, auroras ni textura grain; esas decisiones quedaron históricas
  en ADR-013 y en su spec supersedida.
- La fuente de verdad visual es `apps/web/DESIGN.md` y
  `openspec/specs/diseno-calculadora-clara.md`; `openspec/specs/diseno-visual.md` es un índice
  de compatibilidad para evitar duplicar tokens.
- Las reglas de trabajo de agentes, evidencia y gates están en `AGENTS.md` y
  `docs/ai-agents/`. Las sesiones antiguas en `docs/sesion-*.md` son contexto histórico, no
  instrucciones ejecutables.
