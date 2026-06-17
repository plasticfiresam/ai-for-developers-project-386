export interface EventTypeRow {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  created_at: string;
}

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  createdAt: string;
}

export function mapEventType(row: EventTypeRow): EventType {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    durationMinutes: row.duration_minutes,
    createdAt: row.created_at,
  };
}
