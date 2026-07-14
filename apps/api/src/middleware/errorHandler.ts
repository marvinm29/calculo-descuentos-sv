import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ZodIssue } from 'zod';

interface ApiErrorBody {
  error: string;
  message: string;
  details?: { field: string; message: string }[];
}

function zodIssueToDetail(issue: ZodIssue): { field: string; message: string } {
  const field = issue.path.length > 0 ? issue.path.join('.') : 'request';
  return { field, message: issue.message };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response<ApiErrorBody>,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Datos de entrada inválidos',
      details: err.issues.map(zodIssueToDetail),
    });
    return;
  }

  if (err instanceof Error && err.name === 'RateLimitError') {
    res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas solicitudes. Intente de nuevo en 60 segundos.',
    });
    return;
  }

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Error interno del servidor',
  });
}
