import { config } from '../config.js';
import { computeEndTime, formatMinutesToTime, parseTimeToMinutes } from './time.js';

export function generateSlotStarts(durationMinutes: number): string[] {
  const slots: string[] = [];
  let current = config.workDayStartMinutes;

  while (current + durationMinutes <= config.workDayEndMinutes) {
    slots.push(formatMinutesToTime(current));
    current += durationMinutes;
  }

  return slots;
}

export function durationFitsWorkday(durationMinutes: number): boolean {
  return generateSlotStarts(durationMinutes).length > 0;
}

export function isValidSlotStart(startTime: string, durationMinutes: number): boolean {
  const starts = generateSlotStarts(durationMinutes);
  return starts.includes(startTime);
}

export { computeEndTime };

export type SlotStatus = 'available' | 'booked' | 'past';

export interface Slot {
  date: string;
  startTime: string;
  durationMinutes: number;
  endTime: string;
  status: SlotStatus;
}

export interface BookingInterval {
  startTime: string;
  endTime: string;
}

export function buildSlot(
  date: string,
  startTime: string,
  durationMinutes: number,
  bookings: BookingInterval[],
  isPast: boolean,
): Slot {
  const endTime = computeEndTime(startTime, durationMinutes);

  let status: SlotStatus = 'available';
  if (isPast) {
    status = 'past';
  } else if (hasOverlap(startTime, endTime, bookings)) {
    status = 'booked';
  }

  return {
    date,
    startTime,
    durationMinutes,
    endTime,
    status,
  };
}

export function hasOverlap(
  startTime: string,
  endTime: string,
  bookings: BookingInterval[],
): boolean {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);

  return bookings.some((booking) => {
    const bookingStart = parseTimeToMinutes(booking.startTime);
    const bookingEnd = parseTimeToMinutes(booking.endTime);
    return start < bookingEnd && bookingStart < end;
  });
}

export function buildDaySlots(
  date: string,
  durationMinutes: number,
  bookings: BookingInterval[],
  isPastFn: (startTime: string) => boolean,
): Slot[] {
  return generateSlotStarts(durationMinutes).map((startTime) =>
    buildSlot(date, startTime, durationMinutes, bookings, isPastFn(startTime)),
  );
}

export function countFreeSlots(slots: Slot[]): number {
  return slots.filter((slot) => slot.status === 'available').length;
}

export function countTotalFutureSlots(slots: Slot[]): number {
  return slots.filter((slot) => slot.status !== 'past').length;
}
