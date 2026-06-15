export const queryKeys = {
  health: ['health'] as const,
  eventTypes: {
    all: ['event-types'] as const,
    detail: (id: string) => ['event-types', id] as const,
  },
  calendar: (eventTypeId: string) => ['calendar', eventTypeId] as const,
  daySlots: (eventTypeId: string, date: string) =>
    ['day-slots', eventTypeId, date] as const,
  guestBookings: (guestId: string) => ['guest-bookings', guestId] as const,
  upcomingBookings: ['upcoming-bookings'] as const,
};
