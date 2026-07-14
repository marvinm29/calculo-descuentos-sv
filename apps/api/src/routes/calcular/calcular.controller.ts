import type { Request, Response, NextFunction } from 'express';
import { calcularRequestSchema, validarNegocio } from '@calc/shared';
import { calcularService } from './calcular.service.js';

export function calcularController(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const parsed = calcularRequestSchema.parse(req.body);
    const negocioErrors = validarNegocio(parsed);
    if (negocioErrors.length > 0) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        details: negocioErrors,
      });
      return;
    }

    const result = calcularService(parsed);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
