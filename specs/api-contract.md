# Contrato de API - Calculadora de Descuentos SV

## Base URL

- **Desarrollo**: `http://localhost:3001/api`
- **Produccion**: `https://calculo-descuentos-sv.onrender.com/api`

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
    brutoTotal: number;
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
    "horasExtraDiurna": 12.50,
    "horasExtraNocturna": 0.00,
    "diaLibreDiurna": 40.00,
    "diaLibreNocturna": 19.69,
    "asueto": 0.00,
    "brutoTotal": 472.19
  },
  "descuentos": {
    "isss": {
      "porcentaje": 3.00,
      "salarioAsegurable": 472.19,
      "descuento": 14.17
    },
    "afp": {
      "porcentaje": 7.25,
      "salarioCotizable": 472.19,
      "descuento": 34.23
    },
    "renta": {
      "baseGravable": 423.79,
      "tramo": 2,
      "porcentajeExceso": 10.00,
      "cuotaFija": 17.67,
      "descuento": 26.18
    },
    "totalDescuentos": 74.58
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
    "quincena25": null
  },
  "neto": {
    "salarioLiquido": 397.61
  }
}
```

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
