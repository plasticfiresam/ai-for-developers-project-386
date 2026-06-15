import { Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { bookingsApi } from '@/api/bookings';
import { calendarApi } from '@/api/calendar';
import { daysApi } from '@/api/days';
import { eventTypesApi } from '@/api/event-types';
import type { Booking, Slot } from '@/api/types';
import { ApiErrorAlert } from '@/components/ApiErrorAlert';
import { BookingConfirmation } from '@/components/BookingConfirmation';
import { BookingWindowCalendar } from '@/components/BookingWindowCalendar';
import { DaySlotsList } from '@/components/DaySlotsList';
import { PageLoader } from '@/components/PageLoader';
import { useGuestId } from '@/hooks/useGuestId';
import { queryKeys } from '@/hooks/query-keys';
import { formatDate, formatDuration } from '@/lib/format';

export function BookingPage() {
  const { eventTypeId = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const guestId = useGuestId();

  const selectedDate = searchParams.get('date') ?? undefined;
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const eventTypeQuery = useQuery({
    queryKey: queryKeys.eventTypes.detail(eventTypeId),
    queryFn: () => eventTypesApi.getById(eventTypeId),
    enabled: Boolean(eventTypeId),
  });

  const calendarQuery = useQuery({
    queryKey: queryKeys.calendar(eventTypeId),
    queryFn: () => calendarApi.getWindow(eventTypeId),
    enabled: Boolean(eventTypeId),
  });

  const slotsQuery = useQuery({
    queryKey: queryKeys.daySlots(eventTypeId, selectedDate ?? ''),
    queryFn: () => daysApi.getSlots(selectedDate!, eventTypeId),
    enabled: Boolean(eventTypeId && selectedDate),
  });

  const bookingMutation = useMutation({
    mutationFn: () =>
      bookingsApi.create({
        guestId,
        eventTypeId,
        date: selectedDate!,
        startTime: selectedSlot!.startTime,
      }),
    onSuccess: (booking) => {
      setConfirmedBooking(booking);
      setSelectedSlot(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.calendar(eventTypeId) });
      if (selectedDate) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.daySlots(eventTypeId, selectedDate),
        });
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.guestBookings(guestId) });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === 'slot_conflict') {
        notifications.show({
          color: 'red',
          title: 'Слот занят',
          message: error.message,
        });
        void queryClient.invalidateQueries({ queryKey: queryKeys.calendar(eventTypeId) });
        if (selectedDate) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.daySlots(eventTypeId, selectedDate),
          });
        }
        setSelectedSlot(null);
        return;
      }

      notifications.show({
        color: 'red',
        title: 'Ошибка бронирования',
        message: error instanceof Error ? error.message : 'Не удалось создать запись',
      });
    },
  });

  const handleSelectDay = (day: { date: string; isSelectable: boolean }) => {
    if (!day.isSelectable) {
      return;
    }
    setSelectedSlot(null);
    setSearchParams({ date: day.date });
  };

  const handleSelectSlot = (slot: Slot) => {
    if (slot.status !== 'available') {
      return;
    }
    setSelectedSlot(slot);
  };

  if (eventTypeQuery.isLoading || calendarQuery.isLoading) {
    return <PageLoader />;
  }

  if (eventTypeQuery.isError) {
    return (
      <Stack gap="md">
        <ApiErrorAlert error={eventTypeQuery.error} />
        <Button component={Link} to="/" variant="light">
          На главную
        </Button>
      </Stack>
    );
  }

  if (calendarQuery.isError) {
    return <ApiErrorAlert error={calendarQuery.error} />;
  }

  const eventType = eventTypeQuery.data!;
  const calendar = calendarQuery.data!;

  if (confirmedBooking) {
    return (
      <Stack gap="lg">
        <BookingConfirmation booking={confirmedBooking} />
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Button
            variant="subtle"
            size="compact-sm"
            onClick={() => navigate('/')}
            mb="xs"
          >
            ← Назад
          </Button>
          <Title order={2}>{eventType.name}</Title>
          <Text c="dimmed" size="sm">
            {eventType.description || 'Без описания'} ·{' '}
            {formatDuration(eventType.durationMinutes)}
          </Text>
        </div>
      </Group>

      <Paper withBorder p="md" radius="md">
        <BookingWindowCalendar
          calendar={calendar}
          selectedDate={selectedDate}
          onSelectDay={handleSelectDay}
        />
      </Paper>

      {selectedDate && (
        <Paper withBorder p="md" radius="md">
          <Text size="sm" c="dimmed" mb="md">
            {formatDate(selectedDate)}
          </Text>

          {slotsQuery.isLoading && <PageLoader />}

          {slotsQuery.isError && <ApiErrorAlert error={slotsQuery.error} />}

          {slotsQuery.isSuccess && (
            <>
              <DaySlotsList
                slots={slotsQuery.data.slots}
                selectedStartTime={selectedSlot?.startTime}
                onSelectSlot={handleSelectSlot}
              />

              {selectedSlot && (
                <Group mt="lg">
                  <Button
                    loading={bookingMutation.isPending}
                    onClick={() => bookingMutation.mutate()}
                  >
                    Записаться
                  </Button>
                </Group>
              )}
            </>
          )}
        </Paper>
      )}
    </Stack>
  );
}
