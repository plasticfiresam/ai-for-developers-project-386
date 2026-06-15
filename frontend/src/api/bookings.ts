import { request } from './client';
import type {
  Booking,
  BookingListResponse,
  CreateBookingRequest,
} from './types';

export const bookingsApi = {
  create(body: CreateBookingRequest): Promise<Booking> {
    return request('/bookings', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  listByGuest(guestId: string, upcoming = true): Promise<BookingListResponse> {
    const params = new URLSearchParams({
      guestId,
      upcoming: String(upcoming),
    });
    return request(`/bookings?${params}`);
  },

  getById(bookingId: string): Promise<Booking> {
    return request(`/bookings/${bookingId}`);
  },

  listUpcoming(): Promise<BookingListResponse> {
    return request('/bookings/upcoming');
  },
};
