# Tasas Legales Vigentes - El Salvador

> **Ultima actualizacion**: Julio 2026
> **Verificar periodicamente** con las fuentes oficiales. Las tasas pueden cambiar
> por reformas legales o decretos ejecutivos publicados en el Diario Oficial.

---

## Fuentes Oficiales (.gob.sv)

| Institucion | URL | Informacion Relevante |
|-------------|-----|----------------------|
| **MTPS** - Ministerio de Trabajo | `https://www.mtps.gob.sv` | Horas extra (Art. 168-169 CT), aguinaldo, vacaciones |
| **ISSS** - Instituto Salvadoreno del Seguro Social | `https://www.isss.gob.sv` | Planilla, Ley del Seguro Social, porcentajes |
| **SSF** - Superintendencia del Sistema Financiero | `https://ssf.gob.sv` | AFP, Sistema de Planilla Unica (SPU) |
| **MH** - Ministerio de Hacienda | `https://www.mh.gob.sv` | Renta, formularios F-11, F-14, tabla progresiva |
| **Diario Oficial** | `https://www.diariooficial.gob.sv` | Publicacion de leyes y reformas |
| **Transparencia Fiscal** | `https://www.transparenciafiscal.gob.sv` | Tasas efectivas, marco normativo |

### Referencia externa

| Sitio | URL | Uso |
|-------|-----|-----|
| **Mi Salario SV** | `https://misalariosv.com` | Validacion cruzada de calculos |

---

## ISSS - Instituto Salvadoreno del Seguro Social

### Cotizacion Laboral (Descuento al Trabajador)

| Concepto | Porcentaje | Tope Mensual | Descuento Maximo |
|----------|-----------|--------------|-----------------|
| Salud, Maternidad y Riesgos Profesionales | **3.00%** | $1,000.00 | $30.00 |

**Fuente**: Ley del Seguro Social. Disponible en `https://www.isss.gob.sv/descargas/`

### Cotizacion Patronal (No descontado al trabajador, solo informativo)

| Concepto | Porcentaje | Tope Mensual |
|----------|-----------|--------------|
| Salud y Maternidad | 7.50% | $1,000.00 |
| IVM (Invalidez, Vejez y Muerte) | 1.50% | $1,000.00 |

*Nota: El IVM patronal se paga al ISSS para cubrir pensionados del sistema antiguo.
Los trabajadores actuales cotizan para pension via AFP.*

### Formula

```
salarioAsegurable = min(salarioBruto, 1000.00)
descuentoISSS = salarioAsegurable * 0.03
```

**Ejemplo**: Con salario bruto de $800.00 → ISSS = $24.00
**Ejemplo**: Con salario bruto de $1,200.00 → ISSS = $30.00 (tope)

---

## AFP - Sistema de Pensiones

### Cotizacion Laboral (Descuento al Trabajador)

| Concepto | Porcentaje | Tope Mensual Aprox. |
|----------|-----------|---------------------|
| Cuenta Individual de Ahorro para Pensiones | **7.25%** | $6,843.48 |

### Cotizacion Patronal (No descontado al trabajador, solo informativo)

| Concepto | Porcentaje |
|----------|-----------|
| Aporte patronal a CIAP | 8.75% |

**Fuente**: Art. 16 Ley Integral del Sistema de Pensiones (LISP)
**Referencia**: `https://ssf.gob.sv` - Sistema de Planilla Unica

### Formula

```
salarioCotizable = min(salarioBruto, topeAFP)
descuentoAFP = salarioCotizable * 0.0725
```

**Ejemplo**: Con salario bruto de $800.00 → AFP = $58.00
**Ejemplo**: Con salario bruto de $10,000.00 → AFP ~= $496.15 (topado)

---

## Renta - Impuesto sobre la Renta

### Tabla Progresiva Mensual (Art. 37 LISR)

*Aprobada mediante Decreto Legislativo No. 293 publicado en Diario Oficial Tomo 447
de fecha 30 de abril de 2025, y Decreto Ejecutivo No. 10 de 2025.*

| Tramo | Desde | Hasta | % Sobre Exceso | Cuota Fija |
|-------|-------|-------|----------------|------------|
| **I** | $0.01 | $550.00 | Exento | $0.00 |
| **II** | $550.01 | $895.24 | 10% | $17.67 |
| **III** | $895.25 | $2,038.10 | 20% | $60.00 |
| **IV** | $2,038.11 | En adelante | 30% | $288.57 |

### Formula

```
baseGravableMensual = salarioBruto - ISSS - AFP

// Identificar tramo y calcular:
si baseGravableMensual <= 550.00:
    renta = 0.00  // Exento — aplica a salario mínimo ($408.80) y superior hasta $550

si 550.01 <= baseGravableMensual <= 895.24:
    renta = (baseGravableMensual - 550.00) * 0.10 + 17.67

si 895.25 <= baseGravableMensual <= 2038.10:
    renta = (baseGravableMensual - 895.24) * 0.20 + 60.00

si baseGravableMensual >= 2038.11:
    renta = (baseGravableMensual - 2038.10) * 0.30 + 288.57
```

### Para periodo quincenal

La tabla se divide entre 2 (los tramos y la cuota fija se reducen a la mitad).

**Ejemplo mensual**: Salario bruto $800.00 → base gravable = $718.00 → Tramo II
→ Renta = ($718.00 - $550.00) * 0.10 + $17.67 = $34.47

**Salario mínimo $408.80**: base gravable ≈ $366.90 → Tramo I → Renta = $0.00

**Fuente**: `https://www.mh.gob.sv` - Formulario F-14 (Declaracion Mensual de Pago a Cuenta)
**Fuente**: `https://www.diariooficial.gob.sv` - Tomo 447, 30 de abril de 2025

---

## Horas Extra - Codigo de Trabajo

### Definiciones Legales

| Concepto | Definicion Legal | Articulo |
|----------|-----------------|----------|
| Jornada diurna | 6:00 AM - 7:00 PM, max 8h/dia, 44h/semana | Art. 161 |
| Jornada nocturna | 7:00 PM - 6:00 AM, max 7h/dia, 39h/semana | Art. 161 |
| Jornada mixta | Compuesta por horas diurnas y nocturnas (>4h nocturnas = nocturna) | Art. 161 |
| Nocturnidad | Recargo del 25% sobre salario por hora diurno | Art. 168 |

### Factores de Pago

| Tipo de Hora Extra | Factor | Calculo | Base Legal |
|--------------------|--------|---------|------------|
| Extra diurna (exceso jornada) | **2.00x** | `salarioHora * 2.0` | Art. 169 CT |
| Extra nocturna (exceso jornada) | **2.25x** | `salarioHora * 2.25` | Art. 168+169 CT |
| Dia libre - diurna | **1.50x** | `salarioHora * 1.50` | Art. 173 CT |
| Dia libre - nocturna | **1.75x** | `salarioHora * 1.75` | Art. 168+173 CT |
| Dia de asueto | **2.00x** | `salarioHora * 2.00` | Estandar laboral |

**Fuente verificada**: `https://www.mtps.gob.sv/2025/11/24/direccion-general-de-inspeccion-de-trabajo/`

### Jornada Nocturna Regular

Las horas regulares en jornada nocturna tienen un recargo del 25% (Art. 168 CT):
```
salarioHoraNocturna = salarioHoraDiurna * 1.25
```

### Salario por Hora

```
salarioDiario = salarioMensual / 30
salarioHoraDiurna = salarioDiario / 8
salarioHoraNocturna = salarioHoraDiurna * 1.25
```

**Ejemplo**: Salario mensual $800.00
- Salario por hora diurna = $800 / 30 / 8 = **$3.33**
- Hora extra diurna = $3.33 * 2.00 = **$6.67**
- Hora extra nocturna = $3.33 * 2.25 = **$7.50**
- Dia libre diurna = $3.33 * 1.50 = **$5.00**
- Dia libre nocturna = $3.33 * 1.75 = **$5.83**

### Dias de Asueto (Festivos Nacionales)

| Fecha | Festividad |
|-------|-----------|
| 1 de enero | Ano Nuevo |
| Jueves, Viernes, Sabado Santo | Semana Santa |
| 1 de mayo | Dia del Trabajo |
| 10 de mayo | Dia de la Madre |
| 17 de junio | Dia del Padre |
| 6 de agosto | Divino Salvador del Mundo |
| 15 de septiembre | Independencia |
| 2 de noviembre | Dia de Los Difuntos |
| 25 de diciembre | Navidad |

---

## Aguinaldo (Art. 198-200 Codigo de Trabajo)

| Antiguedad | Dias de Salario | Formula |
|------------|----------------|---------|
| Menos de 1 ano | Proporcional | `(diasLaborados / 365) * 15 * salarioDiario` |
| 1 a 3 anos | 15 dias | `15 * salarioDiario` |
| 3 a 9 anos | 19 dias | `19 * salarioDiario` |
| 10 anos o mas | 21 dias | `21 * salarioDiario` |

**Fecha maxima de pago**: 20 de diciembre de cada ano.
**Calculo**: Se toma el salario base (sin horas extra ni bonos).

---

## Vacaciones (Art. 177 Codigo de Trabajo)

**Periodo de vacaciones**: 15 dias por cada ano de trabajo continuo.
**Bono vacacional**: 30% del salario de las vacaciones.

```
montoVacaciones = salarioDiario * 15
bonoVacacional = montoVacaciones * 0.30
```

**Nota**: El bono por vacaciones NO esta sujeto a descuentos de ley (ISSS, AFP, Renta).

---

## Quincena 25 (Ley Especial)

| Concepto | Valor |
|----------|-------|
| Porcentaje | 50% del salario mensual |
| Salario maximo para aplicar | $1,500.00 |
| Obligatorio sector publico | Si |
| Obligatorio sector privado | Opcional en 2026, obligatorio desde 2027 |
| Fecha de pago | Entre el 15 y 25 de enero |
| Sujeto a descuentos | No (ISSS, AFP, Renta no aplican) |

**Fuente**: `https://www.mtps.gob.sv/2026/01/14/ministro-de-trabajo-informa-aplicacion-de-ley-quincena-25/`

---

## Resumen de Formato en Codigo

```typescript
// packages/shared/src/tasas.ts

export const ISSS = {
  PORCENTAJE_TRABAJADOR: 0.03,
  PORCENTAJE_PATRONAL: 0.075,
  TOPE_MENSUAL: 1000.00,
} as const;

export const AFP = {
  PORCENTAJE_TRABAJADOR: 0.0725,
  PORCENTAJE_PATRONAL: 0.0875,
  TOPE_MENSUAL: 6843.48,
} as const;

export const RENTA_TRAMOS_MENSUAL = [
  { tramo: 1, desde: 0.01, hasta: 550.00, porcentajeExceso: 0.00, cuotaFija: 0.00 },
  { tramo: 2, desde: 550.01, hasta: 895.24, porcentajeExceso: 0.10, cuotaFija: 17.67 },
  { tramo: 3, desde: 895.25, hasta: 2038.10, porcentajeExceso: 0.20, cuotaFija: 60.00 },
  { tramo: 4, desde: 2038.11, hasta: Infinity, porcentajeExceso: 0.30, cuotaFija: 288.57 },
] as const;

export const HORAS_EXTRA = {
  EXTRA_DIURNA: 2.00,
  EXTRA_NOCTURNA: 2.25,
  DIA_LIBRE_DIURNA: 1.50,
  DIA_LIBRE_NOCTURNA: 1.75,
  ASUETO: 2.00,
  NOCTURNIDAD: 1.25,
} as const;

export const AGUINALDO_DIAS = {
  MENOS_1: 15,    // proporcional
  DE_1_A_3: 15,
  DE_3_A_9: 19,
  DE_10_O_MAS: 21,
} as const;

export const VACACIONES = {
  DIAS_POR_ANO: 15,
  BONO_PORCENTAJE: 0.30,
} as const;

export const QUINCENA_25 = {
  PORCENTAJE: 0.50,
  SALARIO_MAXIMO: 1500.00,
} as const;
```
