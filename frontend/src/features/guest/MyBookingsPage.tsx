import { Paper, Stack, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '@/api/bookings';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { BookingRow } from '@/components/BookingRow';
import { EmptyState } from '@/components/EmptyState';
import { PageLoader } from '@/components/PageLoader';
import { useGuestId } from '@/hooks/useGuestId';
import { queryKeys } from '@/hooks/query-keys';

export function MyBookingsPage() {
  const guestId = useGuestId();

  const query = useQuery({
    queryKey: queryKeys.guestBookings(guestId),
    queryFn: () => bookingsApi.listByGuest(guestId, true),
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
      <Title order={2}>Мои записи</Title>

      {items.length === 0 ? (
        <EmptyState
          title="У вас нет предстоящих записей"
          description="Запишитесь на звонок, выбрав тип встречи на главной странице."
          actionLabel="Выбрать тип встречи"
          actionTo="/"
        />
      ) : (
        <Stack gap="sm">
          {items.map((booking) => (
            <Paper key={booking.id} withBorder p="md" radius="md">
              <BookingRow booking={booking} />
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
