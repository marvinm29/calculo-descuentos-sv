import { z } from 'zod';

// Esquemas Zod espejo del contrato API (ver specs/api-contract.md).
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

// Fechas ISO 8601 (YYYY-MM-DD). Validamos con regex; el parse exacto lo hace el Servicio.
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe estar en formato ISO 8601 (YYYY-MM-DD)');

export const segmentoHorarioSchema = z.object({
  fecha: isoDate,
  tipo: tipoJornadaSchema,
  horas: z.number().min(0).max(24, 'Las horas por día deben estar entre 0 y 24'),
});

export const incentivoSchema = z.object({
  id: z.string().min(1),
  concepto: z.string().min(1),
  monto: z.number().min(0),
  aplicaDescuentos: z.boolean().default(true),
});

export const calcularRequestSchema = z
  .object({
    salarioBase: z
      .number()
      .positive('Salario base debe ser positivo')
      .max(100000, 'Salario base debe ser menor a $100,000'),
    tipoPago: tipoPagoSchema,
    fechaInicio: isoDate,
    fechaFin: isoDate,
    antiguedad: antiguedadSchema,
    fechaIngreso: isoDate,
    segmentos: z.array(segmentoHorarioSchema),
    horasBaseNocturnas: z.number().min(0).optional(),
    incentivos: z.array(incentivoSchema).optional(),
  })
  .refine((d) => d.fechaInicio <= d.fechaFin, {
    message: 'Fecha de inicio debe ser anterior a la fecha de fin',
    path: ['fechaInicio'],
  })
  .refine((d) => d.fechaIngreso <= d.fechaFin, {
    message: 'Fecha de ingreso no puede ser posterior al periodo',
    path: ['fechaIngreso'],
  });

export type CalcularRequestParsed = z.infer<typeof calcularRequestSchema>;

// Validaciones de negocio que el controlador reporta como 400 (ver api-contract.md §Validaciones de Negocio).
export const validarNegocio = (
  req: CalcularRequestParsed,
): { field: string; message: string }[] => {
  const details: { field: string; message: string }[] = [];
  const inicio = new Date(req.fechaInicio);
  const fin = new Date(req.fechaFin);
  const diffMs = fin.getTime() - inicio.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDias > 31) {
    details.push({ field: 'fechaFin', message: 'El periodo no puede exceder 31 días' });
  }
  return details;
};