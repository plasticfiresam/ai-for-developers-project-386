import { Paper, Stack, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '@/api/bookings';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { BookingRow } from '@/components/BookingRow';
import { EmptyState } from '@/components/EmptyState';
import { PageLoader } from '@/components/PageLoader';
import { queryKeys } from '@/hooks/query-keys';

export function UpcomingBookingsPage() {
  const query = useQuery({
    queryKey: queryKeys.upcomingBookings,
    queryFn: () => bookingsApi.listUpcoming(),
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
      <Title order={2}>Предстоящие встречи</Title>

      {items.length === 0 ? (
        <EmptyState title="Нет предстоящих встреч" />
      ) : (
        <Stack gap="sm">
          {items.map((booking) => (
            <Paper key={booking.id} withBorder p="md" radius="md">
              <BookingRow booking={booking} showGuestId />
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
