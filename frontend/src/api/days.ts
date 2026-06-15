import { request } from './client';
import type { DaySlotsResponse } from './types';

export const daysApi = {
  getSlots(date: string, eventTypeId: string): Promise<DaySlotsResponse> {
    const params = new URLSearchParams({ eventTypeId });
    return request(`/days/${date}/slots?${params}`);
  },
};
