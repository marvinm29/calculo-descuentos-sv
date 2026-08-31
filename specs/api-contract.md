# Contrato de API - Calculadora de Descuentos SV

## Base URL

- **Desarrollo**: `http://localhost:3001/api`
- **Produccion**: `https://api.marvinmelendez.engineer/api` (DigitalOcean — no Render)

> **Nota (2026-08-30)**: este documento fue corregido para coincidir con la fórmula legal.
> El fixture numérico usa los valores reales del motor (`packages/shared`); los números viejos
> ($12.50, $19.69, brutoTotal $472.19, quincena25 `null`) eran errores del contrato,
> no de la fórmula (Sprint 2 eligió `specs/tasas-legales.md`). Verdad congelada en `openspec/specs/contrato-calcular.md`.

## POST /api/calcular

Calcula salario bruto, descuentos de ley y prestaciones para un periodo.

### Request

```typescript
interface CalcularRequest {
  salarioBase: number;
  tipoPago: 'mensual' | 'quincenal';
  fechaInicio: string;          // ISO 8601: "2026-07-01"
  fechaFin: string;             // ISO 8601: "2026-07-15"
  antiguedad: 'menos_1' | '1_a_3' | '3_a_9' | '10_o_mas';
  fechaIngreso: string;         // ISO 8601
  segmentos: SegmentoHorario[];
  horasBaseNocturnas?: number;  // opcional — deriva recargo 25%
  incentivos?: Incentivo[];     // opcional
}

interface Incentivo {
  id: string;
  concepto: string;
  monto: number;                // ≥ 0
  aplicaDescuentos: boolean;    // default true
}

interface SegmentoHorario {
  fecha: string;                // ISO 8601
  tipo: 'regular_diurna'
      | 'regular_nocturna'
      | 'extra_diurna'
      | 'extra_nocturna'
      | 'dia_libre_diurna'
      | 'dia_libre_nocturna'
      | 'asueto';
  horas: number;                // Entre 0 y 24
}
```

**Ejemplo de request:**

```json
{
  "salarioBase": 800.00,
  "tipoPago": "quincenal",
  "fechaInicio": "2026-07-01",
  "fechaFin": "2026-07-15",
  "antiguedad": "3_a_9",
  "fechaIngreso": "2021-03-15",
  "segmentos": [
    { "fecha": "2026-07-01", "tipo": "regular_diurna", "horas": 8 },
    { "fecha": "2026-07-01", "tipo": "extra_diurna", "horas": 2 },
    { "fecha": "2026-07-02", "tipo": "regular_diurna", "horas": 8 },
    { "fecha": "2026-07-06", "tipo": "dia_libre_diurna", "horas": 8 },
    { "fecha": "2026-07-06", "tipo": "dia_libre_nocturna", "horas": 3 }
  ]
}
```

### Response (200 OK)

```typescript
interface CalcularResponse {
  bruto: {
    salarioBase: number;
    horasExtraDiurna: number;
    horasExtraNocturna: number;
    diaLibreDiurna: number;
    diaLibreNocturna: number;
    asueto: number;
    recargoNocturnidad: number;
    incentivos: number;           // total (gravados + no gravados)
    incentivosGravados: number;
    brutoTotal: number;           // brutoGravable + no gravados
  };
  descuentos: {
    isss: {
      porcentaje: number;       // 3.00
      salarioAsegurable: number;
      descuento: number;
    };
    afp: {
      porcentaje: number;       // 7.25
      salarioCotizable: number;
      descuento: number;
    };
    renta: {
      baseGravable: number;
      tramo: number;            // I, II, III, IV
      porcentajeExceso: number;
      cuotaFija: number;
      descuento: number;
    };
    totalDescuentos: number;
  };
  prestaciones: {
    aguinaldo: {
      dias: number;
      monto: number;
      proporcional: boolean;
    } | null;
    vacaciones: {
      porcentaje: number;       // 30.00
      monto: number;
    } | null;
    quincena25: {
      porcentaje: number;       // 50.00
      monto: number;
    } | null;
  };
  neto: {
    salarioLiquido: number;
  };
}
```

**Ejemplo de response:**

```json
{
  "bruto": {
    "salarioBase": 400.00,
    "horasExtraDiurna": 13.33,
    "horasExtraNocturna": 0.00,
    "diaLibreDiurna": 40.00,
    "diaLibreNocturna": 17.50,
    "asueto": 0.00,
    "recargoNocturnidad": 0.00,
    "incentivos": 0.00,
    "incentivosGravados": 0.00,
    "brutoTotal": 470.83
  },
  "descuentos": {
    "isss": {
      "porcentaje": 3.00,
      "salarioAsegurable": 470.83,
      "descuento": 14.12
    },
    "afp": {
      "porcentaje": 7.25,
      "salarioCotizable": 470.83,
      "descuento": 34.14
    },
    "renta": {
      "baseGravable": 422.57,
      "tramo": 2,
      "porcentajeExceso": 10.00,
      "cuotaFija": 8.84,
      "descuento": 23.60
    },
    "totalDescuentos": 71.86
  },
  "prestaciones": {
    "aguinaldo": {
      "dias": 19,
      "monto": 506.67,
      "proporcional": false
    },
    "vacaciones": {
      "porcentaje": 30.00,
      "monto": 120.00
    },
    "quincena25": {
      "porcentaje": 50.00,
      "monto": 400.00
    }
  },
  "neto": {
    "salarioLiquido": 398.97
  }
}
```

> **Nota sobre prestaciones**: quincena25 = $400 para $800 (salario ≤ $1,500). El contrato viejo
> ponía `null` por error. Vacaciones = bono 30% de 15 días (RF05), informativo.

### Errores

#### 400 Bad Request - Validacion

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Datos de entrada invalidos",
  "details": [
    {
      "field": "salarioBase",
      "message": "Debe ser un numero positivo"
    },
    {
      "field": "segmentos.2.horas",
      "message": "Las horas deben estar entre 0 y 24"
    }
  ]
}
```

#### 429 Too Many Requests

```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Demasiadas solicitudes. Intente de nuevo en 60 segundos."
}
```

#### 500 Internal Server Error

```json
{
  "error": "INTERNAL_ERROR",
  "message": "Error interno del servidor"
}
```

### Validaciones de Negocio

El backend valida las siguientes reglas:

| Regla | Mensaje de error |
|-------|-----------------|
| `salarioBase > 0 && salarioBase <= 100000` | "Salario base debe ser positivo y menor a $100,000" |
| `fechaInicio <= fechaFin` | "Fecha de inicio debe ser anterior a la fecha de fin" |
| `diferenciaDias <= 31` | "El periodo no puede exceder 31 dias" |
| `segmentos[].horas >= 0 && <= 24` | "Las horas por dia deben estar entre 0 y 24" |
| `segmentos[].tipo` valido | "Tipo de segmento invalido" |
| `fechaIngreso <= fechaFin` | "Fecha de ingreso no puede ser posterior al periodo" |

### Cabeceras

**Request:**
```
Content-Type: application/json
```

**Response:**
```
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1750000000
```
