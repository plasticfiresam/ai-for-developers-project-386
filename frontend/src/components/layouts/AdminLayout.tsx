import {
  AppShell,
  Container,
  NavLink,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { CalendarBlankIcon, ListBulletsIcon, ArrowLeftIcon } from '@phosphor-icons/react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  {
    to: '/admin/event-types',
    label: 'Типы событий',
    icon: ListBulletsIcon,
    match: (path: string) => path.startsWith('/admin/event-types'),
  },
  {
    to: '/admin/bookings',
    label: 'Предстоящие встречи',
    icon: CalendarBlankIcon,
    match: (path: string) => path.startsWith('/admin/bookings'),
  },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <AppShell navbar={{ width: 260, breakpoint: 'sm' }} padding="md">
      <AppShell.Navbar p="md">
        <Stack gap="xs" h="100%">
          <Title order={4} mb="sm">
            Админка
          </Title>

          {NAV_ITEMS.map(({ to, label, icon: Icon, match }) => (
            <NavLink
              key={to}
              component={Link}
              to={to}
              label={label}
              leftSection={<Icon size={18} />}
              active={match(location.pathname)}
            />
          ))}

          <NavLink
            component={Link}
            to="/"
            label="К странице записи"
            leftSection={<ArrowLeftIcon size={18} />}
            mt="auto"
          />

          <Text size="xs" c="dimmed">
            Без авторизации — MVP
          </Text>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="lg">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
