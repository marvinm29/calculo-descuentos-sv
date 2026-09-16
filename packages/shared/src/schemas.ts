import { z } from 'zod';

// Esquemas Zod espejo del contrato API (ver specs/api-contract.md e
// openspec/specs/integridad-calculo.md).
// La inferencia de tipos debe coincidir con ./types.ts (CalcularRequest/Response).

export const tipoPagoSchema = z.enum(['mensual', 'quincenal']);
export const antiguedadSchema = z.enum(['menos_1', '1_a_3', '3_a_9', '10_o_mas']);
export const tipoJornadaSchema = z.enum([
  'regular_diurna',
  'regular_nocturna',
  'extra_diurna',
  'extra_nocturna',
  'dia_libre_diurna',
  'dia_libre_nocturna',
  'asueto',
]);

// Límites del contrato (ver openspec/specs/integridad-calculo.md, Regla 6).
export const LIMITES_CONTRATO = {
  MAX_SEGMENTOS: 100,
  MAX_INCENTIVOS: 50,
  MAX_HORAS_DIARIAS: 24,
  MAX_DIAS_PERIODO: 31, // días inclusivos
  MAX_CONCEPTO: 100,
  MAX_ID: 64,
} as const;

// Regla 1 — fecha de calendario real (YYYY-MM-DD, agnóstica de zona horaria).
export function esFechaCalendarioValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const anio = Number(fecha.slice(0, 4));
  const mes = Number(fecha.slice(5, 7));
  const dia = Number(fecha.slice(8, 10));
  if (mes < 1 || mes > 12 || dia < 1) return false;
  const diasEnMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  return dia <= diasEnMes;
}

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe estar en formato ISO 8601 (YYYY-MM-DD)')
  .refine(esFechaCalendarioValida, 'Fecha de calendario inválida (mes o día imposible)');

// Regla 4 — números finitos (rechaza NaN, Infinity, -Infinity).
const numeroFinito = z
  .number()
  .refine(Number.isFinite, 'Debe ser un número finito');

export const segmentoHorarioSchema = z.object({
  fecha: isoDate,
  tipo: tipoJornadaSchema,
  horas: numeroFinito
    .min(0, 'Las horas no pueden ser negativas')
    .max(24, 'Las horas por día deben estar entre 0 y 24'),
});

export const incentivoSchema = z.object({
  id: z.string().min(1).max(LIMITES_CONTRATO.MAX_ID),
  concepto: z
    .string()
    .min(1, 'El concepto no puede estar vacío')
    .max(LIMITES_CONTRATO.MAX_CONCEPTO),
  monto: numeroFinito.min(0, 'El monto no puede ser negativo'),
  aplicaDescuentos: z.boolean().default(true),
});

export const calcularRequestSchema = z
  .strictObject({
    salarioBase: numeroFinito
      .positive('Salario base debe ser positivo')
      .max(100000, 'Salario base debe ser menor a $100,000'),
    tipoPago: tipoPagoSchema,
    fechaInicio: isoDate,
    fechaFin: isoDate,
    antiguedad: antiguedadSchema,
    fechaIngreso: isoDate,
    segmentos: z
      .array(segmentoHorarioSchema)
      .max(LIMITES_CONTRATO.MAX_SEGMENTOS, `Máximo ${LIMITES_CONTRATO.MAX_SEGMENTOS} segmentos`),
    incentivos: z
      .array(incentivoSchema)
      .max(LIMITES_CONTRATO.MAX_INCENTIVOS, `Máximo ${LIMITES_CONTRATO.MAX_INCENTIVOS} incentivos`)
      .optional(),
  })
  .refine((d) => d.fechaInicio <= d.fechaFin, {
    message: 'Fecha de inicio debe ser anterior a la fecha de fin',
    path: ['fechaInicio'],
  })
  .refine((d) => d.fechaIngreso <= d.fechaFin, {
    message: 'Fecha de ingreso no puede ser posterior al periodo',
    path: ['fechaIngreso'],
  })
  .superRefine((d, ctx) => {
    // Regla 2 — segmentos dentro del período.
    d.segmentos.forEach((seg, i) => {
      if (seg.fecha < d.fechaInicio || seg.fecha > d.fechaFin) {
        ctx.addIssue({
          code: 'custom',
          message: 'La fecha del segmento debe estar dentro del período',
          path: ['segmentos', i, 'fecha'],
        });
      }
    });

    // Regla 3 — acumulado máximo de 24 h por fecha.
    const acumulado = new Map<string, number>();
    d.segmentos.forEach((seg, i) => {
      const total = (acumulado.get(seg.fecha) ?? 0) + seg.horas;
      acumulado.set(seg.fecha, total);
      if (total > LIMITES_CONTRATO.MAX_HORAS_DIARIAS) {
        ctx.addIssue({
          code: 'custom',
          message: `La suma de horas para ${seg.fecha} excede ${LIMITES_CONTRATO.MAX_HORAS_DIARIAS} h`,
          path: ['segmentos', i, 'fecha'],
        });
      }
    });
  });

export type CalcularRequestParsed = z.infer<typeof calcularRequestSchema>;

// ─── Schemas de persistencia local (Regla 8, openspec/specs/integridad-calculo.md) ───

export const tipoEntradaSchema = z.enum(['extra', 'dia_libre', 'asueto']);
export const modalidadJornadaSchema = z.enum(['diurna', 'nocturna']);

export const entradaPeriodoSchema = z.object({
  id: z.string().min(1).max(LIMITES_CONTRATO.MAX_ID),
  fecha: isoDate,
  tipo: tipoEntradaSchema,
  horasDiurnas: numeroFinito.min(0).max(24),
  horasNocturnas: numeroFinito.min(0).max(24),
});

export const entradasPeriodoSchema = z
  .array(entradaPeriodoSchema)
  .max(LIMITES_CONTRATO.MAX_SEGMENTOS);

export const jornadaConfigSchema = z.object({
  modalidad: modalidadJornadaSchema,
});

export const incentivosGuardadosSchema = z
  .array(incentivoSchema)
  .max(LIMITES_CONTRATO.MAX_INCENTIVOS);

// ConfigInicial del frontend: fechaIngreso vacía (sin configurar) o fecha real.
export const configInicialPersistenciaSchema = z.object({
  salarioBase: numeroFinito.min(0),
  tipoPago: tipoPagoSchema,
  antiguedad: antiguedadSchema,
  fechaIngreso: z.union([z.literal(''), isoDate]),
});

// Validaciones de negocio que el controlador reporta como 400 (ver api-contract.md §Validaciones de Negocio).
export const validarNegocio = (
  req: CalcularRequestParsed,
): { field: string; message: string }[] => {
  const details: { field: string; message: string }[] = [];
  const dias = (s: string) => s.split('-').map(Number);
  const [inicioY, inicioM, inicioD] = dias(req.fechaInicio);
  const [finY, finM, finD] = dias(req.fechaFin);
  const inicioUtc = Date.UTC(inicioY ?? 0, (inicioM ?? 1) - 1, inicioD ?? 1);
  const finUtc = Date.UTC(finY ?? 0, (finM ?? 1) - 1, finD ?? 1);
  const diffDias = Math.floor((finUtc - inicioUtc) / (1000 * 60 * 60 * 24));
  // Regla 5 — máximo 31 días inclusivos ⇒ diferencia máxima de 30 días calendario.
  if (diffDias > LIMITES_CONTRATO.MAX_DIAS_PERIODO - 1) {
    details.push({
      field: 'fechaFin',
      message: `El periodo no puede exceder ${LIMITES_CONTRATO.MAX_DIAS_PERIODO} días (inclusivos)`,
    });
  }
  return details;
};
