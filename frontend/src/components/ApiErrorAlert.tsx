import { Alert } from '@mantine/core';
import { ApiError } from '@/api/client';
import type { ErrorCode } from '@/api/types';
import { getErrorMessage } from '@/lib/format';

const ERROR_TITLES: Partial<Record<ErrorCode, string>> = {
  validation_error: 'Ошибка валидации',
  slot_conflict: 'Слот занят',
  not_found: 'Не найдено',
  duplicate_id: 'Дубликат идентификатора',
  has_upcoming_bookings: 'Есть предстоящие встречи',
  internal_error: 'Ошибка сервера',
};

interface ApiErrorAlertProps {
  error: unknown;
  title?: string;
}

export function ApiErrorAlert({ error, title }: ApiErrorAlertProps) {
  const code = error instanceof ApiError ? error.code : undefined;
  const resolvedTitle = title ?? (code ? ERROR_TITLES[code] : 'Ошибка');

  return (
    <Alert color="red" title={resolvedTitle}>
      {getErrorMessage(error)}
    </Alert>
  );
}
