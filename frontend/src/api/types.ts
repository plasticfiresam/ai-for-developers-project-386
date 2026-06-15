export type SlotStatus = 'available' | 'booked' | 'past';

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

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  createdAt: string;
}

export interface CreateEventTypeRequest {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface UpdateEventTypeRequest {
  name: string;
  description: string;
  durationMinutes: number;
}

export interface EventTypeListResponse {
  items: EventType[];
  total: number;
}

export interface Booking {
  id: string;
  guestId: string;
  eventTypeId: string;
  eventTypeName: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  endTime: string;
  createdAt: string;
}

export interface CreateBookingRequest {
  guestId: string;
  eventTypeId: string;
  date: string;
  startTime: string;
}

export interface BookingListResponse {
  items: Booking[];
  total: number;
}

export interface Slot {
  date: string;
  startTime: string;
  durationMinutes: number;
  endTime: string;
  status: SlotStatus;
}

export interface DayAvailability {
  date: string;
  freeSlotCount: number;
  totalSlotCount: number;
  isSelectable: boolean;
}

export interface DaySlotsResponse {
  eventTypeId: string;
  date: string;
  durationMinutes: number;
  slots: Slot[];
}

export interface CalendarResponse {
  eventTypeId: string;
  durationMinutes: number;
  windowStart: string;
  windowEnd: string;
  days: DayAvailability[];
}

export interface HealthResponse {
  status: 'ok';
}
