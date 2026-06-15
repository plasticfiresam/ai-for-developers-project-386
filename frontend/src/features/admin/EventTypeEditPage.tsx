import { Stack, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventTypesApi } from '@/api/event-types';
import type { UpdateEventTypeRequest } from '@/api/types';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { EventTypeForm } from '@/components/EventTypeForm';
import { PageLoader } from '@/components/PageLoader';
import { queryKeys } from '@/hooks/query-keys';

export function EventTypeEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);

  const query = useQuery({
    queryKey: queryKeys.eventTypes.detail(id),
    queryFn: () => eventTypesApi.getById(id),
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: (values: UpdateEventTypeRequest) =>
      eventTypesApi.update(id, values),
    onSuccess: () => {
      notifications.show({ color: 'green', message: 'Изменения сохранены' });
      navigate('/admin/event-types');
    },
    onError: (err) =>
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка')),
  });

  if (query.isLoading) {
    return <PageLoader />;
  }

  if (query.isError) {
    return <ApiErrorAlert error={query.error} />;
  }

  const eventType = query.data!;

  return (
    <Stack gap="lg">
      <Title order={2}>Редактирование: {eventType.name}</Title>
      {error && <ApiErrorAlert error={error} />}
      <EventTypeForm
        mode="edit"
        initialValues={{
          id: eventType.id,
          name: eventType.name,
          description: eventType.description,
          durationMinutes: eventType.durationMinutes,
        }}
        loading={mutation.isPending}
        onSubmit={(values) => {
          setError(null);
          mutation.mutate(values as UpdateEventTypeRequest);
        }}
        onCancel={() => navigate('/admin/event-types')}
      />
    </Stack>
  );
}
