import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ZodIssue } from 'zod';

// Mensaje único del 429: lo usa el handler de express-rate-limit (app.ts) y
// este errorHandler. Cambiarlo en un solo lugar.
export const MENSAJE_RATE_LIMIT =
  'Demasiadas solicitudes. Intente de nuevo en 60 segundos.';

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

  // Nota: el 429 no pasa por aquí — express-rate-limit v7 no lanza errores de
  // rate limit; responde directamente con su `handler` configurado en app.ts.
  // Todo lo que llega a este punto es un error interno (500).

  console.error('[ERROR]', err instanceof Error ? err.stack : err);

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Error interno del servidor',
  });
}
