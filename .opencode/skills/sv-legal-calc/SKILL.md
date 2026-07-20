---
name: sv-legal-calc
description: Cálculos de descuentos de ley y prestaciones laborales de El Salvador (ISSS, AFP, Renta, horas extra, aguinaldo, vacaciones, Quincena 25). Úsala SIEMPRE que se toque lógica de cálculo salarial, se modifique packages/shared/src/tasas.ts, se agreguen tramos de renta, se validen ejemplos numéricos, o se escriban/importen tasas en apps/web o apps/api. También cuando el usuario mencione salario, descuentos, prestaciones, horas extra, nocturnidad, o cotización. Evita que se hardcodeen tasas en componentes o servicios.
license: MIT
metadata:
  domain: el-salvador-labor-law
  source_spec: specs/tasas-legales.md
---

# Cálculos legales salvadoreños

## Invariant NON-NEGOTIABLES

- **Fuente única de tasas**: `packages/shared/src/tasas.ts`. NUNCA hardcodees una tasa (3%, 7.25%, 2.00x, etc.) en `apps/web/src/` ni en `apps/api/src/`. Impórtala desde `@calc/shared`.
- **Sincronización de docs**: modificar `tasas.ts` exige actualizar `specs/tasas-legales.md` en el mismo cambio. No se acepta PR que rompa el par.
- **Moneda**: USD, tipo `number`, siempre 2 decimales en salida (usa `Math.round(x * 100) / 100` o `toFixed(2)` solo al renderizar; en cálculos intermedios conserva full precision).
- **Modo offline**: los cálculos corren en el cliente importando `packages/shared`. El API solo valida (ADR-001, ADR-006). No dupliques la lógica en el backend: reutiliza `calcular()` de shared.

## Fórmulas vérificables (fuente: specs/tasas-legales.md)

### Salario por hora
```
salarioDiario = salarioMensual / 30
salarioHoraDiurna = salarioDiario / 8
salarioHoraNocturna = salarioHoraDiurna * 1.25   // Art. 168 CT
```

### Horas extra (Art. 168-173 CT)
| Tipo | Factor |
| --- | --- |
| Extra diurna | 2.00x |
| Extra nocturna | 2.25x |
| Día libre diurna | 1.50x |
| Día libre nocturna | 1.75x |
| Asueto | 2.00x |

`pago = salarioHoraDiurna * factor * horas` (la nocturnidad ya viene en el factor para extra_nocturna y dia_libre_nocturna).

### ISSS
```
salarioAsegurable = min(salarioBrutoMensual, 1000.00)
descuento = salarioAsegurable * 0.03          // tope $30
```

### AFP
```
salarioCotizable = min(salarioBrutoMensual, 6843.48)
descuento = salarioCotizable * 0.0725
```

### Renta (Art. 37 LISR, tabla mensual vigente desde D.L. 293, 2025-04-30)
```
baseGravable = salarioBruto - ISSS - AFP
 aplica tramo I/II/III/IV:
  I   <= 550.00      → 0
  II  550.01–895.24  → (bg - 550.00) * 0.10 + 17.67
  III 895.25–2038.10 → (bg - 895.24) * 0.20 + 60.00
  IV  >= 2038.11     → (bg - 2038.10) * 0.30 + 288.57
```
**Quincenal**: divide tramos y cuotas fijas entre 2. NUNCA dividas el descuento final entre 2 — divide la tabla.

### Aguinaldo (Art. 198-200 CT)
- < 1 año: `(diasLaborados / 365) * 15 * salarioDiario` (proporcional)
- 1–3 años: `15 * salarioDiario`
- 3–9 años: `19 * salarioDiario`
- 10+ años: `21 * salarioDiario`

Base = salario base (sin horas extra ni bonos).

### Vacaciones (Art. 177 CT)
```
montoVacaciones = salarioDiario * 15
bonoVacacional = montoVacaciones * 0.30        // NO sujeto a ISSS/AFP/Renta
```

### Quincena 25
- Solo si `salarioMensual <= 1500.00`.
- `monto = salarioMensual * 0.50`.
- NO sujeto a descuentos.

## Fixture de referencia (debe reproducirse exacto)

Salario $800.00 mensual:
- salarioHoraDiurna = 3.333…
- extra diurna = 6.67/h
- extra nocturna = 7.50/h
- día libre diurna = 5.00/h
- día libre nocturna = 5.83/h
- ISSS = 24.00
- AFP = 58.00
- base gravable = 718.00 → tramo II → Renta = (718.00 - 550.00) * 0.10 + 17.67 = **34.47**

Ver spec/api-contract.md para el ejemplo $800 quincenal, 3–9 años → todos los valores target.

## Cuándo NO usar esta skill

- UI pura sin tocar fórmulas.
- Configuración de build, lint, types.
- Tests que solo mockean la salida de `calcular()`.

## Checklist antes de cerrar un cambio en cálculo

- [ ] Tasas importadas desde `@calc/shared` (cero literales numéricos de tasa en código de app).
- [ ] Si se modificó `tasas.ts`, `specs/tasas-legales.md` se actualizó en el mismo commit.
- [ ] Test unitario reproduce el fixture $800 mensual y el ejemplo quincenal del API contract.
- [ ] `pnpm test --coverage` mantiene > 80% sobre `packages/shared`.
- [ ] `pnpm lint && pnpm check-types` pasan.