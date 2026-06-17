export type ErrorCode =
  | 'validation_error'
  | 'slot_conflict'
  | 'not_found'
  | 'duplicate_id'
  | 'has_upcoming_bookings'
  | 'internal_error';

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function toErrorResponse(error: AppError): ErrorResponse {
  return {
    code: error.code,
    message: error.message,
    ...(error.details ? { details: error.details } : {}),
  };
}
