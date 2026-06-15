import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { ClockIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import type { EventType } from '@/api/types';
import { formatDuration } from '@/lib/format';

interface EventTypeCardProps {
  eventType: EventType;
}

export function EventTypeCard({ eventType }: EventTypeCardProps) {
  return (
    <Card withBorder padding="lg" radius="md" h="100%">
      <Stack justify="space-between" h="100%" gap="md">
        <div>
          <Group justify="space-between" align="flex-start" mb="xs">
            <Title order={4}>{eventType.name}</Title>
            <Badge
              leftSection={<ClockIcon size={12} />}
              variant="light"
            >
              {formatDuration(eventType.durationMinutes)}
            </Badge>
          </Group>
          {eventType.description ? (
            <Text size="sm" c="dimmed">
              {eventType.description}
            </Text>
          ) : (
            <Text size="sm" c="dimmed" fs="italic">
              Без описания
            </Text>
          )}
        </div>

        <Button
          component={Link}
          to={`/book/${encodeURIComponent(eventType.id)}`}
          fullWidth
        >
          Выбрать время
        </Button>
      </Stack>
    </Card>
  );
}
