import Database, { type Database as DatabaseType } from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH: string = process.env['DATABASE_PATH'] ?? path.resolve(__dirname, '..', 'data', 'calculos.db');

if (DB_PATH !== ':memory:') {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const db: DatabaseType = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS calculation_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    request_data TEXT NOT NULL,
    response_data TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_history_user ON calculation_history(user_id)
`);

export { db };
