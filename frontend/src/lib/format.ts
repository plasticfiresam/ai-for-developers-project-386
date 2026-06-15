const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
const DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return DATE_FORMATTER.format(new Date(year, month - 1, day));
}

export function formatWeekday(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return WEEKDAY_FORMATTER.format(new Date(year, month - 1, day));
}

export function formatDayNumber(isoDate: string): string {
  return isoDate.split('-')[2] ?? isoDate;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`;
}

export function formatDuration(minutes: number): string {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} ч`;
  }
  return `${minutes} мин`;
}

export function truncateGuestId(guestId: string, length = 8): string {
  if (guestId.length <= length) {
    return guestId;
  }
  return `${guestId.slice(0, length)}…`;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Произошла неизвестная ошибка';
}
