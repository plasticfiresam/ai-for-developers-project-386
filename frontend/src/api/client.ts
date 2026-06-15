import type { ErrorResponse } from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorResponse['code'];
  readonly details?: Record<string, unknown>;

  constructor(status: number, body: ErrorResponse) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }
}

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ErrorResponse;
    if (body.code && body.message) {
      return new ApiError(response.status, body);
    }
  } catch {
    // fall through
  }

  return new ApiError(response.status, {
    code: 'internal_error',
    message: response.statusText || 'Request failed',
  });
}

export async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...init?.headers,
  };

  if (init?.body !== undefined) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export { baseUrl as apiBaseUrl };
