import { Badge, Button, Group, Stack, Text, Title } from '@mantine/core';
import type { Slot, SlotStatus } from '@/api/types';
import { formatTimeRange } from '@/lib/format';

const STATUS_LABELS: Record<SlotStatus, string> = {
  available: 'Свободен',
  booked: 'Занят',
  past: 'Прошёл',
};

const STATUS_COLORS: Record<SlotStatus, string> = {
  available: 'green',
  booked: 'red',
  past: 'gray',
};

interface DaySlotsListProps {
  slots: Slot[];
  selectedStartTime?: string;
  onSelectSlot: (slot: Slot) => void;
}

export function DaySlotsList({
  slots,
  selectedStartTime,
  onSelectSlot,
}: DaySlotsListProps) {
  if (slots.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="md">
        Нет слотов на этот день
      </Text>
    );
  }

  return (
    <Stack gap="md">
      <Title order={4}>Выберите время</Title>
      <Group gap="sm">
        {slots.map((slot) => {
          const isSelected = slot.startTime === selectedStartTime;
          const isAvailable = slot.status === 'available';

          return (
            <Button
              key={slot.startTime}
              variant={isSelected ? 'filled' : 'light'}
              disabled={!isAvailable}
              onClick={() => onSelectSlot(slot)}
              rightSection={
                <Badge
                  size="xs"
                  color={STATUS_COLORS[slot.status]}
                  variant="outline"
                >
                  {STATUS_LABELS[slot.status]}
                </Badge>
              }
            >
              {formatTimeRange(slot.startTime, slot.endTime)}
            </Button>
          );
        })}
      </Group>
    </Stack>
  );
}
