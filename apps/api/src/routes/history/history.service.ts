import { db } from '../../db.js';
import type { CalcularRequest, CalcularResponse } from '@calc/shared';

export interface HistoryRow {
  id: string;
  user_id: string;
  request_data: string;
  response_data: string;
  created_at: string;
}

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `hist-${Date.now()}-${idCounter}`;
}

export function createHistory(
  userId: string,
  request: CalcularRequest,
  response: CalcularResponse,
): HistoryRow {
  const id = generateId();
  const stmt = db.prepare(`
    INSERT INTO calculation_history (id, user_id, request_data, response_data)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, userId, JSON.stringify(request), JSON.stringify(response));
  return {
    id,
    user_id: userId,
    request_data: JSON.stringify(request),
    response_data: JSON.stringify(response),
    created_at: new Date().toISOString(),
  };
}

export function getHistory(userId: string): HistoryRow[] {
  const stmt = db.prepare(`
    SELECT id, user_id, request_data, response_data, created_at
    FROM calculation_history
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);
  return stmt.all(userId) as HistoryRow[];
}

export function deleteHistory(userId: string, id: string): boolean {
  const stmt = db.prepare(`
    DELETE FROM calculation_history
    WHERE id = ? AND user_id = ?
  `);
  const result = stmt.run(id, userId);
  return result.changes > 0;
}
