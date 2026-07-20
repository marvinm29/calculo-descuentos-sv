import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import type { CalcularRequest, CalcularResponse } from '@calc/shared';
import { createHistory, getHistory, deleteHistory } from './history.service.js';

export function createHistoryController(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'No autenticado' });
      return;
    }

    const body = req.body as {
      request: Record<string, unknown>;
      response: Record<string, unknown>;
    };
    if (!body.request || !body.response) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Se requieren los campos request y response',
      });
      return;
    }

    const history = createHistory(userId, body.request as unknown as CalcularRequest, body.response as unknown as CalcularResponse);
    res.status(201).json(history);
  } catch (err) {
    next(err);
  }
}

export function getHistoryController(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'No autenticado' });
      return;
    }

    const history = getHistory(userId);
    res.json(history);
  } catch (err) {
    next(err);
  }
}

export function deleteHistoryController(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'No autenticado' });
      return;
    }

    const { id } = req.params as { id: string };
    if (!id) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Se requiere el id del historial',
      });
      return;
    }

    const deleted = deleteHistory(userId, id);
    if (!deleted) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Historial no encontrado',
      });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
