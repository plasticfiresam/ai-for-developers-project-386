export const config = {
  port: Number(process.env.PORT ?? 3000),
  databasePath: process.env.DATABASE_PATH ?? './data/app.db',
  timezone: process.env.TIMEZONE ?? 'Europe/Moscow',
  workDayStartMinutes: 9 * 60,
  workDayEndMinutes: 19 * 60,
  bookingWindowDays: 14,
} as const;
