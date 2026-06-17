import { getDb } from '../db/connection.js';
import {
  mapBooking,
  mapBookingInterval,
  type Booking,
  type BookingRow,
} from '../mappers/booking.js';
import { isUpcomingBooking } from '../domain/time.js';

function rowToBooking(row: Record<string, unknown>): BookingRow {
  return {
    id: String(row.id),
    guest_id: String(row.guest_id),
    event_type_id: String(row.event_type_id),
    event_type_name: String(row.event_type_name),
    date: String(row.date),
    start_time: String(row.start_time),
    duration_minutes: Number(row.duration_minutes),
    end_time: String(row.end_time),
    created_at: String(row.created_at),
  };
}

export const bookingsRepository = {
  findById(id: string): Booking | undefined {
    const row = getDb()
      .prepare('SELECT * FROM bookings WHERE id = ?')
      .get(id) as Record<string, unknown> | undefined;
    return row ? mapBooking(rowToBooking(row)) : undefined;
  },

  findByDate(date: string): Booking[] {
    const rows = getDb()
      .prepare('SELECT * FROM bookings WHERE date = ? ORDER BY start_time ASC')
      .all(date) as Record<string, unknown>[];
    return rows.map((row) => mapBooking(rowToBooking(row)));
  },

  findIntervalsByDate(date: string): { startTime: string; endTime: string }[] {
    const rows = getDb()
      .prepare('SELECT * FROM bookings WHERE date = ?')
      .all(date) as Record<string, unknown>[];
    return rows.map((row) => mapBookingInterval(rowToBooking(row)));
  },

  listByGuest(guestId: string, upcomingOnly: boolean): Booking[] {
    const rows = getDb()
      .prepare('SELECT * FROM bookings WHERE guest_id = ? ORDER BY date ASC, start_time ASC')
      .all(guestId) as Record<string, unknown>[];

    const bookings = rows.map((row) => mapBooking(rowToBooking(row)));
    if (!upcomingOnly) {
      return bookings;
    }

    return bookings.filter((booking) =>
      isUpcomingBooking(booking.date, booking.startTime),
    );
  },

  listUpcoming(): Booking[] {
    const rows = getDb()
      .prepare('SELECT * FROM bookings ORDER BY date ASC, start_time ASC')
      .all() as Record<string, unknown>[];

    return rows
      .map((row) => mapBooking(rowToBooking(row)))
      .filter((booking) => isUpcomingBooking(booking.date, booking.startTime));
  },

  hasUpcomingByEventTypeId(eventTypeId: string): boolean {
    const rows = getDb()
      .prepare('SELECT date, start_time FROM bookings WHERE event_type_id = ?')
      .all(eventTypeId) as Record<string, unknown>[];

    return rows.some((row) =>
      isUpcomingBooking(String(row.date), String(row.start_time)),
    );
  },

  create(data: {
    id: string;
    guestId: string;
    eventTypeId: string;
    eventTypeName: string;
    date: string;
    startTime: string;
    durationMinutes: number;
    endTime: string;
    createdAt: string;
  }): Booking {
    getDb()
      .prepare(
        `INSERT INTO bookings (
          id, guest_id, event_type_id, event_type_name,
          date, start_time, duration_minutes, end_time, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        data.id,
        data.guestId,
        data.eventTypeId,
        data.eventTypeName,
        data.date,
        data.startTime,
        data.durationMinutes,
        data.endTime,
        data.createdAt,
      );

    return this.findById(data.id)!;
  },
};
