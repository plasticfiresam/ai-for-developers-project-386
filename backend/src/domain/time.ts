import { config } from '../config.js';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: config.timezone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: config.timezone,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function getNow(): Date {
  return new Date();
}

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatTime(date: Date): string {
  return timeFormatter.format(date);
}

export function getToday(): string {
  return formatDate(getNow());
}

export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function getBookingWindow(): { windowStart: string; windowEnd: string } {
  const windowStart = getToday();
  const windowEnd = addDays(windowStart, config.bookingWindowDays - 1);
  return { windowStart, windowEnd };
}

export function isDateInWindow(date: string): boolean {
  const { windowStart, windowEnd } = getBookingWindow();
  return date >= windowStart && date <= windowEnd;
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function computeEndTime(startTime: string, durationMinutes: number): string {
  return formatMinutesToTime(parseTimeToMinutes(startTime) + durationMinutes);
}

export function isPastSlot(date: string, startTime: string): boolean {
  const today = getToday();
  if (date < today) {
    return true;
  }
  if (date > today) {
    return false;
  }

  const nowMinutes = parseTimeToMinutes(formatTime(getNow()));
  return parseTimeToMinutes(startTime) < nowMinutes;
}

export function isUpcomingBooking(date: string, startTime: string): boolean {
  const today = getToday();
  if (date > today) {
    return true;
  }
  if (date < today) {
    return false;
  }

  const nowMinutes = parseTimeToMinutes(formatTime(getNow()));
  return parseTimeToMinutes(startTime) > nowMinutes;
}

export function enumerateDates(start: string, end: string): string[] {
  const dates: string[] = [];
  let current = start;
  while (current <= end) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}
