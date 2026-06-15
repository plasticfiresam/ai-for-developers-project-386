import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: EmptyStateProps) {
  return (
    <Center py="xl">
      <Stack align="center" gap="sm" maw={420}>
        <Title order={3} ta="center">
          {title}
        </Title>
        {description && (
          <Text c="dimmed" ta="center">
            {description}
          </Text>
        )}
        {actionLabel && actionTo && (
          <Button component={Link} to={actionTo} variant="light">
            {actionLabel}
          </Button>
        )}
        {actionLabel && onAction && !actionTo && (
          <Button onClick={onAction} variant="light">
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Center>
  );
}
