import { Stack, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { eventTypesApi } from '@/api/event-types';
import type { CreateEventTypeRequest } from '@/api/types';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { EventTypeForm } from '@/components/EventTypeForm';
import { useState } from 'react';

const INITIAL_VALUES: CreateEventTypeRequest = {
  id: '',
  name: '',
  description: '',
  durationMinutes: 30,
};

export function EventTypeCreatePage() {
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);

  const mutation = useMutation({
    mutationFn: (values: CreateEventTypeRequest) => eventTypesApi.create(values),
    onSuccess: () => {
      notifications.show({ color: 'green', message: 'Тип события создан' });
      navigate('/admin/event-types');
    },
    onError: (err) =>
      setError(err instanceof Error ? err : new Error('Неизвестная ошибка')),
  });

  return (
    <Stack gap="lg">
      <Title order={2}>Новый тип события</Title>
      {error && <ApiErrorAlert error={error} />}
      <EventTypeForm
        mode="create"
        initialValues={INITIAL_VALUES}
        loading={mutation.isPending}
        onSubmit={(values) => {
          setError(null);
          mutation.mutate(values as CreateEventTypeRequest);
        }}
        onCancel={() => navigate('/admin/event-types')}
      />
    </Stack>
  );
}
