// Fuente única de tasas legales salvadoreñas vigentes.
// NO modificar sin actualizar specs/tasas-legales.md en el mismo cambio.
// Ver specs/tasas-legales.md § "Resumen de Formato en Codigo".
// Última actualización: Julio 2026.

export const ISSS = {
  PORCENTAJE_TRABAJADOR: 0.03,
  PORCENTAJE_PATRONAL: 0.075,
  TOPE_MENSUAL: 1000.0,
} as const;

export const AFP = {
  PORCENTAJE_TRABAJADOR: 0.0725,
  PORCENTAJE_PATRONAL: 0.0875,
  TOPE_MENSUAL: 6843.48,
} as const;

export const RENTA_TRAMOS_MENSUAL = [
  { tramo: 1, desde: 0.01, hasta: 338.67, porcentajeExceso: 0.0, cuotaFija: 0.0 },
  { tramo: 2, desde: 338.68, hasta: 761.9, porcentajeExceso: 0.1, cuotaFija: 17.67 },
  { tramo: 3, desde: 761.91, hasta: 1904.76, porcentajeExceso: 0.2, cuotaFija: 60.0 },
  { tramo: 4, desde: 1904.77, hasta: Number.POSITIVE_INFINITY, porcentajeExceso: 0.3, cuotaFija: 288.57 },
] as const;

export const HORAS_EXTRA = {
  EXTRA_DIURNA: 2.0,
  EXTRA_NOCTURNA: 2.25,
  DIA_LIBRE_DIURNA: 1.5,
  DIA_LIBRE_NOCTURNA: 1.75,
  ASUETO: 2.0,
  NOCTURNIDAD: 1.25,
} as const;

export const AGUINALDO_DIAS = {
  MENOS_1: 15, // proporcional
  DE_1_A_3: 15,
  DE_3_A_9: 19,
  DE_10_O_MAS: 21,
} as const;

export const VACACIONES = {
  DIAS_POR_ANO: 15,
  BONO_PORCENTAJE: 0.3,
} as const;

export const QUINCENA_25 = {
  PORCENTAJE: 0.5,
  SALARIO_MAXIMO: 1500.0,
} as const;

// Días de asueto festivos nacionales de El Salvador con fecha fija.
// Semana Santa (Jueves, Viernes, Sábado Santo) tiene fecha variable — se calcula
// para cada año en runtime (no se incluye aquí como constante).
export const DIAS_ASUETO_FIJOS = [
  { mes: 1, dia: 1, nombre: 'Año Nuevo' },
  { mes: 5, dia: 1, nombre: 'Día del Trabajo' },
  { mes: 5, dia: 10, nombre: 'Día de la Madre' },
  { mes: 6, dia: 17, nombre: 'Día del Padre' },
  { mes: 8, dia: 6, nombre: 'Divino Salvador del Mundo' },
  { mes: 9, dia: 15, nombre: 'Independencia' },
  { mes: 11, dia: 2, nombre: 'Día de los Difuntos' },
  { mes: 12, dia: 25, nombre: 'Navidad' },
] as const;