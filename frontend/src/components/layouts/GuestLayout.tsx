import {
  Alert,
  Anchor,
  AppShell,
  Container,
  Group,
  Text,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { healthApi } from '@/api/health';
import { queryKeys } from '@/hooks/query-keys';

export function GuestLayout() {
  const location = useLocation();
  const healthQuery = useQuery({
    queryKey: queryKeys.health,
    queryFn: () => healthApi.check(),
    retry: false,
    refetchInterval: 30_000,
  });

  const isMyBookings = location.pathname === '/my-bookings';

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container h="100%" size="lg">
          <Group h="100%" justify="space-between">
            <Anchor component={Link} to="/" underline="never">
              <Title order={3}>Запись на звонок</Title>
            </Anchor>
            <Group gap="md">
              <Anchor
                component={Link}
                to="/my-bookings"
                fw={isMyBookings ? 600 : 400}
              >
                Мои записи
              </Anchor>
              <Anchor component={Link} to="/admin" c="dimmed" size="sm">
                Админка
              </Anchor>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg">
          {healthQuery.isError && (
            <Alert color="orange" mb="md" title="API недоступен">
              <Text size="sm">
                Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен
                на {import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}.
              </Text>
            </Alert>
          )}
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
