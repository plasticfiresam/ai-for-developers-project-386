import { request } from './client';
import type { CalendarResponse } from './types';

export const calendarApi = {
  getWindow(eventTypeId: string): Promise<CalendarResponse> {
    const params = new URLSearchParams({ eventTypeId });
    return request(`/calendar?${params}`);
  },
};
