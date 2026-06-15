import { Badge, Group, Paper, SimpleGrid, Text, Title } from '@mantine/core';
import type { CalendarResponse, DayAvailability } from '@/api/types';
import { formatDate, formatDayNumber, formatWeekday } from '@/lib/format';

interface BookingWindowCalendarProps {
  calendar: CalendarResponse;
  selectedDate?: string;
  onSelectDay: (day: DayAvailability) => void;
}

export function BookingWindowCalendar({
  calendar,
  selectedDate,
  onSelectDay,
}: BookingWindowCalendarProps) {
  return (
    <div>
      <Group justify="space-between" mb="md">
        <Title order={4}>Выберите день</Title>
        <Text size="sm" c="dimmed">
          {formatDate(calendar.windowStart)} — {formatDate(calendar.windowEnd)}
        </Text>
      </Group>

      <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 7 }} spacing="sm">
        {calendar.days.map((day) => {
          const isSelected = day.date === selectedDate;
          const isDisabled = !day.isSelectable;

          return (
            <Paper
              key={day.date}
              component="button"
              type="button"
              withBorder
              p="sm"
              disabled={isDisabled}
              onClick={() => onSelectDay(day)}
              style={{
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.55 : 1,
                borderColor: isSelected
                  ? 'var(--mantine-color-blue-filled)'
                  : undefined,
                background: isSelected
                  ? 'var(--mantine-color-blue-light)'
                  : undefined,
                textAlign: 'left',
              }}
            >
              <Text size="xs" c="dimmed" tt="capitalize">
                {formatWeekday(day.date)}
              </Text>
              <Text fw={600} size="lg">
                {formatDayNumber(day.date)}
              </Text>
              <Badge
                size="sm"
                variant={day.freeSlotCount > 0 ? 'light' : 'outline'}
                color={day.freeSlotCount > 0 ? 'green' : 'gray'}
                mt="xs"
              >
                {day.freeSlotCount} своб.
              </Badge>
            </Paper>
          );
        })}
      </SimpleGrid>
    </div>
  );
}
