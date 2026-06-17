import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db: DatabaseSync | undefined;

export function getDb(): DatabaseSync {
  if (!db) {
    const dir = dirname(config.databasePath);
    mkdirSync(dir, { recursive: true });

    db = new DatabaseSync(config.databasePath);
    db.exec('PRAGMA foreign_keys = ON');

    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    db.exec(schema);
  }

  return db;
}

export function runInTransaction<T>(fn: () => T): T {
  const database = getDb();
  database.exec('BEGIN IMMEDIATE');

  try {
    const result = fn();
    database.exec('COMMIT');
    return result;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}
