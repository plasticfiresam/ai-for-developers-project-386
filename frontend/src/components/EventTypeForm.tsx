import { Button, Group, NumberInput, Stack, TextInput, Textarea } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import type { CreateEventTypeRequest, UpdateEventTypeRequest } from '@/api/types';

type EventTypeFormValues = CreateEventTypeRequest;

interface EventTypeFormProps {
  mode: 'create' | 'edit';
  initialValues: EventTypeFormValues;
  loading?: boolean;
  onSubmit: (values: CreateEventTypeRequest | UpdateEventTypeRequest) => void;
  onCancel: () => void;
}

export function EventTypeForm({
  mode,
  initialValues,
  loading,
  onSubmit,
  onCancel,
}: EventTypeFormProps) {
  const form = useForm<EventTypeFormValues>({
    mode: 'uncontrolled',
    initialValues,
    validate: {
      id: mode === 'create' ? isNotEmpty('Укажите идентификатор') : undefined,
      name: isNotEmpty('Укажите название'),
      durationMinutes: (value) =>
        !Number.isInteger(value) || value <= 0
          ? 'Длительность должна быть целым числом больше 0'
          : null,
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    if (mode === 'create') {
      onSubmit(values);
      return;
    }

    const { name, description, durationMinutes } = values;
    onSubmit({ name, description, durationMinutes });
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="ID"
          description="Уникальный идентификатор, например intro-30"
          disabled={mode === 'edit'}
          withAsterisk={mode === 'create'}
          key={form.key('id')}
          {...form.getInputProps('id')}
        />

        <TextInput
          label="Название"
          withAsterisk
          key={form.key('name')}
          {...form.getInputProps('name')}
        />

        <Textarea
          label="Описание"
          minRows={3}
          key={form.key('description')}
          {...form.getInputProps('description')}
        />

        <NumberInput
          label="Длительность (мин)"
          withAsterisk
          min={1}
          allowDecimal={false}
          key={form.key('durationMinutes')}
          {...form.getInputProps('durationMinutes')}
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel} type="button">
            Отмена
          </Button>
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'Создать' : 'Сохранить'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
