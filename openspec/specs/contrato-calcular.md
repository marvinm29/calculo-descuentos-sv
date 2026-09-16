# Spec: Contrato de Cálculo (`POST /api/calcular`)

> Verdad actual congelada de `packages/shared/src/{types,schemas}.ts` y `apps/api/src/routes/calcular/*`.
> Espejo: `specs/api-contract.md`. Reglas de integridad: `openspec/specs/integridad-calculo.md`.
> El frontend **no** llama este endpoint en runtime (offline-first, ADR-006); el API es validador de referencia.

## Base URL

- Desarrollo: `http://localhost:3001/api`
- Producción: `https://api.marvinmelendez.engineer/api` (DigitalOcean — no Render)

## Request

```typescript
interface CalcularRequest {
  salarioBase: number;              // finito, > 0, ≤ 100000
  tipoPago: 'mensual' | 'quincenal';
  fechaInicio: string;              // ISO 8601 + calendario real
  fechaFin: string;                 // ISO 8601 + calendario real
  antiguedad: 'menos_1' | '1_a_3' | '3_a_9' | '10_o_mas';
  fechaIngreso: string;             // ISO 8601 + calendario real
  segmentos: SegmentoHorario[];     // ≤ 100
  incentivos?: Incentivo[];         // opcional, ≤ 50
}

interface SegmentoHorario {
  fecha: string;                    // ISO 8601, dentro de [fechaInicio, fechaFin]
  tipo: 'regular_diurna' | 'regular_nocturna' | 'extra_diurna' | 'extra_nocturna'
      | 'dia_libre_diurna' | 'dia_libre_nocturna' | 'asueto';
  horas: number;                    // finito, 0–24; suma por fecha ≤ 24
}

interface Incentivo {
  id: string;                       // 1–64
  concepto: string;                 // 1–100
  monto: number;                    // finito, ≥ 0
  aplicaDescuentos: boolean;        // default true
}
```

Objeto **estricto**: campos desconocidos → 400. `horasBaseNocturnas` fue eliminado
(2026-09-15): no existe recargo nocturno inferido.

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

- `400 VALIDATION_ERROR` (Zod, objeto estricto) — con `details[]` `{field, message}` y paths
  indexados (`segmentos.0.fecha`); campos desconocidos → `field: "request"`.
- `400` reglas de negocio (`validarNegocio`): período > 31 días inclusivos.
- `429 RATE_LIMIT_EXCEEDED` (100 req/min, por IP real con `TRUST_PROXY=1` detrás de Caddy).
- `500 INTERNAL_ERROR` — mensaje fijo, sin stack ni detalles internos.

## Notas

- **CORS**: sólo en Express (`CORS_ORIGIN`, lista separada por comas, default
  `http://localhost:5173`). Caddy no añade headers CORS.
- **Fechas de calendario reales**: `2026-02-30` y `2025-02-29` se rechazan (Regla 1 de
  integridad); la validación es agnóstica de zona horaria.
- Fixture numérico del `api-contract.md`: **alineado a la fórmula legal** (Sprint 2 eligió
  `tasas-legales.md` sobre los números viejos del contrato — $13.33, $17.50, Quincena 25 = $400 para $800).
- **No auth**: API público y stateless (ADR-011); único endpoint del API.

## ADRs relacionados

- `ADR-005` (API única POST /api/calcular)
- `ADR-001`, `ADR-006`, `ADR-011`