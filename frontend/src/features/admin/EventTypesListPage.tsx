import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { eventTypesApi } from '@/api/event-types';
import type { EventType } from '@/api/types';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { EmptyState } from '@/components/EmptyState';
import { PageLoader } from '@/components/PageLoader';
import { queryKeys } from '@/hooks/query-keys';
import { formatDuration } from '@/lib/format';

export function EventTypesListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<EventType | null>(null);

  const query = useQuery({
    queryKey: queryKeys.eventTypes.all,
    queryFn: () => eventTypesApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (eventTypeId: string) => eventTypesApi.delete(eventTypeId),
    onSuccess: () => {
      notifications.show({
        color: 'green',
        message: 'Тип события удалён',
      });
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.eventTypes.all });
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        title: error instanceof ApiError ? 'Не удалось удалить' : 'Ошибка',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    },
  });

  if (query.isLoading) {
    return <PageLoader />;
  }

  if (query.isError) {
    return <ApiErrorAlert error={query.error} />;
  }

  const items = query.data?.items ?? [];

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Типы событий</Title>
        <Button component={Link} to="/admin/event-types/new">
          Создать тип
        </Button>
      </Group>

      {items.length === 0 ? (
        <EmptyState
          title="Типов событий пока нет"
          description="Создайте первый тип, чтобы гости могли записываться на звонки."
          actionLabel="Создать тип"
          actionTo="/admin/event-types/new"
        />
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Название</Table.Th>
              <Table.Th>Длительность</Table.Th>
              <Table.Th w={100} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text ff="monospace" size="sm">
                    {item.id}
                  </Text>
                </Table.Td>
                <Table.Td>{item.name}</Table.Td>
                <Table.Td>{formatDuration(item.durationMinutes)}</Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <ActionIcon
                      variant="subtle"
                      aria-label="Редактировать"
                      onClick={() =>
                        navigate(
                          `/admin/event-types/${encodeURIComponent(item.id)}/edit`,
                        )
                      }
                    >
                      <PencilSimpleIcon size={18} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      aria-label="Удалить"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <TrashIcon size={18} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Удалить тип события?"
      >
        {deleteTarget && (
          <Stack gap="md">
            <Text size="sm">
              Тип «{deleteTarget.name}» будет удалён. Это невозможно, если есть
              предстоящие встречи на этот тип.
            </Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setDeleteTarget(null)}>
                Отмена
              </Button>
              <Button
                color="red"
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
                Удалить
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
