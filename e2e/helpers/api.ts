import type { APIRequestContext } from '@playwright/test';

export const API_BASE_URL = 'http://localhost:3000';

export const E2E_EVENT_TYPE = {
  id: 'e2e-intro-30',
  name: 'E2E Intro Call',
  description: 'Playwright booking flow test event type',
  durationMinutes: 30,
} as const;

interface CalendarDay {
  date: string;
  freeSlotCount: number;
  isSelectable: boolean;
}

interface CalendarResponse {
  days: CalendarDay[];
}

interface Slot {
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'past';
}

interface DaySlotsResponse {
  slots: Slot[];
}

export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`;
}

export function formatDayNumber(isoDate: string): string {
  return isoDate.split('-')[2] ?? isoDate;
}

export async function createEventType(request: APIRequestContext): Promise<void> {
  const response = await request.post(`${API_BASE_URL}/event-types`, {
    data: E2E_EVENT_TYPE,
  });

  if (response.status() === 409) {
    return;
  }

  if (!response.ok()) {
    throw new Error(`Failed to create event type: ${response.status()} ${await response.text()}`);
  }
}

export async function findFirstAvailableSlot(
  request: APIRequestContext,
  eventTypeId: string,
): Promise<AvailableSlot> {
  const calendarResponse = await request.get(`${API_BASE_URL}/calendar`, {
    params: { eventTypeId },
  });

  if (!calendarResponse.ok()) {
    throw new Error(
      `Failed to load calendar: ${calendarResponse.status()} ${await calendarResponse.text()}`,
    );
  }

  const calendar = (await calendarResponse.json()) as CalendarResponse;
  const day = calendar.days.find((item) => item.isSelectable && item.freeSlotCount > 0);

  if (!day) {
    throw new Error('No selectable day with free slots found in booking window');
  }

  const slotsResponse = await request.get(`${API_BASE_URL}/days/${day.date}/slots`, {
    params: { eventTypeId },
  });

  if (!slotsResponse.ok()) {
    throw new Error(
      `Failed to load day slots: ${slotsResponse.status()} ${await slotsResponse.text()}`,
    );
  }

  const daySlots = (await slotsResponse.json()) as DaySlotsResponse;
  const slot = daySlots.slots.find((item) => item.status === 'available');

  if (!slot) {
    throw new Error(`No available slot found for date ${day.date}`);
  }

  return {
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
  };
}
