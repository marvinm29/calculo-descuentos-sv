# Spec: Dominio de Cálculo

> Verdad actual congelada de `packages/shared/src/calc/*` + `tasas.ts` + `specs/tasas-legales.md`.
> Fuente de números: ley / `tasas-legales.md` (gana sobre cualquier doc viejo).
> Si el código discrepa de esta spec, o se corrige el código o se documenta la desviación (ver §Notas).

## Fórmulas base

- `salarioDiario = salarioMensual / 30`
- `salarioHoraDiurna = salarioDiario / 8`
- `recargoNocturnidad = horasBaseNocturnas × salarioHoraDiurna × 0.25` (Art. 168 CT) — línea visible.

## Factores de pago (Art. 168/169/173 CT)

| Tipo de segmento | Factor |
|---|---|
| `extra_diurna` | 2.00 |
| `extra_nocturna` | 2.25 |
| `dia_libre_diurna` | 1.50 |
| `dia_libre_nocturna` | 1.75 |
| `asueto` | 2.00 |

- Segmentos `regular_diurna` / `regular_nocturna` pagan 0: el salario base sale de `salarioBase`, no de horas ordinarias.
- Extras **sin mínimo**: 1 hora sola se calcula y paga; nunca se absorbe a la base ni se descarta.

## Descuentos de ley

- **ISSS**: 3% sobre `min(brutoPeriodo, $1,000)` → máx $30.
- **AFP**: 7.25% sobre `min(brutoPeriodo, $6,843.48)`.
- **Renta** (Art. 37 LISR, tabla progresiva mensual):
  - `baseGravable = brutoPeriodo − ISSS − AFP`
  - Tramos I–IV con cuota fija y % sobre exceso.
  - **Quincenal divide tramos y cuotas fijas entre 2** (spec legal; el `api-contract.md` viejo se equivocaba).
  - `fechaInicio`/`fechaFin` = hoy (solo alimentan aguinaldo proporcional).

## Bruto y neto

```
brutoGravable = salarioBasePeriodo + horasExtraDiurna + horasExtraNocturna
              + diaLibreDiurna + diaLibreNocturna + asueto
              + recargoNocturnidad + Σ incentivos(aplicaDescuentos)

brutoTotal    = brutoGravable + Σ incentivos(no gravados)

salarioLiquido = brutoTotal − totalDescuentos
```

`salarioBasePeriodo = salarioBase × factorPeriodo` (`quincenal → 0.5`, `mensual → 1`).

## Prestaciones (informativas — NO entran al neto)

- **Aguinaldo** (Art. 198–200): 15 días (1–3 años), 19 (3–9), 21 (10+), proporcional si < 1 año.
  Se calcula sobre `salarioBase` (sin extras ni bonos).
- **Vacaciones**: en código solo el **bono 30% de 15 días** de salario (RF05). El salario de los 15 días lo paga el empleador por separado.
- **Quincena 25**: 50% del salario mensual si `salarioBase ≤ $1,500`; si no, `null`.

## Notas

- **Extra nocturna 2.25x**: se mantiene (misalariosv + Art. 168+169). El MTPS 2025 muestra aritmética inconsistente (~2.49x); se documenta, no se adopta.
- **Discrepancias de redondeo** del `api-contract.md` viejo ($12.50/$19.69 vs $13.33/$17.50): la fórmula gana; el contrato se corrigió.
- **`tasas.ts` es la única fuente de tasas**; no hardcodear en otro archivo. Cualquier cambio en `tasas.ts` debe ir junto con `specs/tasas-legales.md`.

## ADRs relacionados

- `ADR-001` (lógica única en `@calc/shared`)
- `ADR-006` (offline-first: frontend calcula local, API solo valida)