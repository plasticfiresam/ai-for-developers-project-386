import { Button, Group, List, Paper, Stack, Text, Title } from '@mantine/core';
import { CheckCircleIcon } from '@phosphor-icons/react';
import type { Booking } from '@/api/types';
import { formatDate, formatDuration, formatTimeRange } from '@/lib/format';
import { Link } from 'react-router-dom';

interface BookingConfirmationProps {
  booking: Booking;
}

export function BookingConfirmation({ booking }: BookingConfirmationProps) {
  return (
    <Paper withBorder p="lg" radius="md">
      <Stack gap="md">
        <Group gap="sm">
          <CheckCircleIcon size={28} color="var(--mantine-color-green-filled)" />
          <Title order={3}>Запись подтверждена</Title>
        </Group>

        <List spacing="xs" size="sm">
          <List.Item>
            <Text span fw={500}>
              {booking.eventTypeName}
            </Text>
          </List.Item>
          <List.Item>{formatDate(booking.date)}</List.Item>
          <List.Item>
            {formatTimeRange(booking.startTime, booking.endTime)}
          </List.Item>
          <List.Item>{formatDuration(booking.durationMinutes)}</List.Item>
        </List>

        <Group mt="sm">
          <Button component={Link} to="/my-bookings" variant="filled">
            Мои записи
          </Button>
          <Button component={Link} to="/" variant="light">
            На главную
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
