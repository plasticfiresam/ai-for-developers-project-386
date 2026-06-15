import { Badge, Group, Text } from '@mantine/core';
import type { Booking } from '@/api/types';
import { formatDate, formatDuration, formatTimeRange } from '@/lib/format';

interface BookingRowProps {
  booking: Booking;
  showGuestId?: boolean;
}

export function BookingRow({ booking, showGuestId = false }: BookingRowProps) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <div>
        <Text fw={500}>{booking.eventTypeName}</Text>
        <Text size="sm" c="dimmed">
          {formatDate(booking.date)},{' '}
          {formatTimeRange(booking.startTime, booking.endTime)}
        </Text>
        {showGuestId && (
          <Text size="xs" c="dimmed" ff="monospace">
            guest: {booking.guestId}
          </Text>
        )}
      </div>
      <Badge variant="light">{formatDuration(booking.durationMinutes)}</Badge>
    </Group>
  );
}
