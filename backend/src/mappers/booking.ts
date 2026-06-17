export interface BookingRow {
  id: string;
  guest_id: string;
  event_type_id: string;
  event_type_name: string;
  date: string;
  start_time: string;
  duration_minutes: number;
  end_time: string;
  created_at: string;
}

export interface Booking {
  id: string;
  guestId: string;
  eventTypeId: string;
  eventTypeName: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  endTime: string;
  createdAt: string;
}

export function mapBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    guestId: row.guest_id,
    eventTypeId: row.event_type_id,
    eventTypeName: row.event_type_name,
    date: row.date,
    startTime: row.start_time,
    durationMinutes: row.duration_minutes,
    endTime: row.end_time,
    createdAt: row.created_at,
  };
}

export function mapBookingInterval(row: BookingRow): { startTime: string; endTime: string } {
  return {
    startTime: row.start_time,
    endTime: row.end_time,
  };
}
