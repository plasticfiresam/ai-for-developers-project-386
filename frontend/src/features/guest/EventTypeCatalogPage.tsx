import { SimpleGrid, Stack, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { eventTypesApi } from '@/api/event-types';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { EmptyState } from '@/components/EmptyState';
import { EventTypeCard } from '@/components/EventTypeCard';
import { PageLoader } from '@/components/PageLoader';
import { queryKeys } from '@/hooks/query-keys';

export function EventTypeCatalogPage() {
  const query = useQuery({
    queryKey: queryKeys.eventTypes.all,
    queryFn: () => eventTypesApi.list(),
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
      <Title order={2}>Выберите тип встречи</Title>

      {items.length === 0 ? (
        <EmptyState
          title="Нет доступных типов событий"
          description="Владелец ещё не создал типы встреч. Загляните позже."
        />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {items.map((eventType) => (
            <EventTypeCard key={eventType.id} eventType={eventType} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
