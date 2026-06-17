const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function isValidDate(value: string): boolean {
  if (!DATE_REGEX.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidTime(value: string): boolean {
  return TIME_REGEX.test(value);
}

export interface EventTypeInput {
  id?: string;
  name?: string;
  description?: string;
  durationMinutes?: number;
}

export function validateEventTypeInput(
  input: EventTypeInput,
  options: { requireId: boolean },
): string[] {
  const errors: string[] = [];

  if (options.requireId) {
    if (!input.id || input.id.trim() === '') {
      errors.push('id is required');
    }
    if (!input.name || input.name.trim() === '') {
      errors.push('name is required');
    }
    if (
      input.durationMinutes === undefined ||
      !Number.isInteger(input.durationMinutes) ||
      input.durationMinutes < 1
    ) {
      errors.push('durationMinutes is required');
    }
    return errors;
  }

  if (input.name !== undefined && input.name.trim() === '') {
    errors.push('name must not be empty');
  }

  if (
    input.durationMinutes !== undefined &&
    (!Number.isInteger(input.durationMinutes) || input.durationMinutes < 1)
  ) {
    errors.push('durationMinutes must be a positive integer');
  }

  return errors;
}
