import { Center, Loader, Stack, Text } from '@mantine/core';

export function PageLoader() {
  return (
    <Center py="xl">
      <Stack align="center" gap="sm">
        <Loader />
        <Text c="dimmed" size="sm">
          Загрузка…
        </Text>
      </Stack>
    </Center>
  );
}
