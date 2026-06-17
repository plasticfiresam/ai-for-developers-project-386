import { getDb } from '../db/connection.js';
import {
  mapEventType,
  type EventType,
  type EventTypeRow,
} from '../mappers/event-type.js';

function rowToEventType(row: Record<string, unknown>): EventTypeRow {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description),
    duration_minutes: Number(row.duration_minutes),
    created_at: String(row.created_at),
  };
}

export const eventTypesRepository = {
  list(): EventType[] {
    const rows = getDb()
      .prepare('SELECT * FROM event_types ORDER BY created_at ASC')
      .all() as Record<string, unknown>[];
    return rows.map((row) => mapEventType(rowToEventType(row)));
  },

  findById(id: string): EventType | undefined {
    const row = getDb()
      .prepare('SELECT * FROM event_types WHERE id = ?')
      .get(id) as Record<string, unknown> | undefined;
    return row ? mapEventType(rowToEventType(row)) : undefined;
  },

  create(data: {
    id: string;
    name: string;
    description: string;
    durationMinutes: number;
    createdAt: string;
  }): EventType {
    getDb()
      .prepare(
        `INSERT INTO event_types (id, name, description, duration_minutes, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(data.id, data.name, data.description, data.durationMinutes, data.createdAt);

    return this.findById(data.id)!;
  },

  update(
    id: string,
    data: { name: string; description: string; durationMinutes: number },
  ): EventType | undefined {
    const result = getDb()
      .prepare(
        `UPDATE event_types
         SET name = ?, description = ?, duration_minutes = ?
         WHERE id = ?`,
      )
      .run(data.name, data.description, data.durationMinutes, id);

    if (result.changes === 0) {
      return undefined;
    }

    return this.findById(id);
  },

  delete(id: string): boolean {
    const result = getDb().prepare('DELETE FROM event_types WHERE id = ?').run(id);
    return result.changes > 0;
  },
};
