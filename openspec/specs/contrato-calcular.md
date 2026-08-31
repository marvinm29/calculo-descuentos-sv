# Spec: Contrato de Cálculo (`POST /api/calcular`)

> Verdad actual congelada de `packages/shared/src/{types,schemas}.ts` y `apps/api/src/routes/calcular/*`.
> Espejo: `specs/api-contract.md` (corregido para coincidir con la fórmula legal).
> El frontend **no** llama este endpoint en runtime (offline-first, ADR-006); el API es validador de referencia.

## Base URL

- Desarrollo: `http://localhost:3001/api`
- Producción: `https://api.marvinmelendez.engineer/api` (DigitalOcean — no Render)

## Request

```typescript
interface CalcularRequest {
  salarioBase: number;              // > 0, ≤ 100000
  tipoPago: 'mensual' | 'quincenal';
  fechaInicio: string;              // ISO 8601 (hoy)
  fechaFin: string;                 // ISO 8601 (hoy)
  antiguedad: 'menos_1' | '1_a_3' | '3_a_9' | '10_o_mas';
  fechaIngreso: string;             // ISO 8601
  segmentos: SegmentoHorario[];
  horasBaseNocturnas?: number;      // opcional
  incentivos?: Incentivo[];         // opcional
}

interface SegmentoHorario {
  fecha: string;                    // ISO 8601
  tipo: 'regular_diurna' | 'regular_nocturna' | 'extra_diurna' | 'extra_nocturna'
      | 'dia_libre_diurna' | 'dia_libre_nocturna' | 'asueto';
  horas: number;                    // 0–24
}

interface Incentivo {
  id: string;
  concepto: string;
  monto: number;                    // ≥ 0
  aplicaDescuentos: boolean;        // default true
}
```

## Response (200 OK)

```typescript
interface CalcularResponse {
  bruto: {
    salarioBase: number;            // ya con factorPeriodo (quincenal /2)
    horasExtraDiurna: number;
    horasExtraNocturna: number;
    diaLibreDiurna: number;
    diaLibreNocturna: number;
    asueto: number;
    recargoNocturnidad: number;
    incentivos: number;             // total (gravados + no gravados)
    incentivosGravados: number;
    brutoTotal: number;             // brutoGravable + no gravados
  };
  descuentos: {
    isss: { porcentaje; salarioAsegurable; descuento };
    afp: { porcentaje; salarioCotizable; descuento };
    renta: { baseGravable; tramo; porcentajeExceso; cuotaFija; descuento };
    totalDescuentos: number;
  };
  prestaciones: {
    aguinaldo: { dias; monto; proporcional } | null;
    vacaciones: { porcentaje; monto } | null;
    quincena25: { porcentaje; monto } | null;
  };
  neto: { salarioLiquido: number };
}
```

## Errores

- `400 VALIDATION_ERROR` (Zod) — con `details[]`.
- `400` reglas de negocio (`validarNegocio`): periodo > 31 días.
- `429 RATE_LIMIT_EXCEEDED` (100 req/min).
- `500 INTERNAL_ERROR`.

## Notas

- `validarNegocio` no exige `fechaInicio <= fechaFin` ni `fechaIngreso <= fechaFin` en runtime
  (el frontend siempre envía hoy), pero el schema Zod las valida igualmente.
- Fixture numérico del `api-contract.md`: **alineado a la fórmula legal** (Sprint 2 eligió
  `tasas-legales.md` sobre los números viejos del contrato — $13.33, $17.50, Quincena 25 = $400 para $800).
- **No auth**: al eliminar Clerk (ver `specs/plan-rediseno-frontend.md` Sprint 1), este es el único
  endpoint del API y es público.

## ADRs relacionados

- `ADR-005` (API única POST /api/calcular)
- `ADR-001`, `ADR-006`