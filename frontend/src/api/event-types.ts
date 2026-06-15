import { request } from './client';
import type {
  CreateEventTypeRequest,
  EventType,
  EventTypeListResponse,
  UpdateEventTypeRequest,
} from './types';

export const eventTypesApi = {
  list(): Promise<EventTypeListResponse> {
    return request('/event-types');
  },

  getById(eventTypeId: string): Promise<EventType> {
    return request(`/event-types/${encodeURIComponent(eventTypeId)}`);
  },

  create(body: CreateEventTypeRequest): Promise<EventType> {
    return request('/event-types', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  update(eventTypeId: string, body: UpdateEventTypeRequest): Promise<EventType> {
    return request(`/event-types/${encodeURIComponent(eventTypeId)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete(eventTypeId: string): Promise<void> {
    return request(`/event-types/${encodeURIComponent(eventTypeId)}`, {
      method: 'DELETE',
    });
  },
};
