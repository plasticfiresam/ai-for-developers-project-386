import type { FastifyInstance } from 'fastify';
import { AppError, toErrorResponse } from '../errors.js';
import {
  buildDaySlots,
  countFreeSlots,
  countTotalFutureSlots,
} from '../domain/slots.js';
import {
  enumerateDates,
  getBookingWindow,
  isPastSlot,
} from '../domain/time.js';
import { bookingsRepository } from '../repositories/bookings.js';
import { eventTypesRepository } from '../repositories/event-types.js';

export async function calendarRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: { eventTypeId?: string } }>(
    '/calendar',
    async (request, reply) => {
      const { eventTypeId } = request.query;

      if (!eventTypeId) {
        return reply.status(400).send(
          toErrorResponse(new AppError(400, 'validation_error', 'eventTypeId is required')),
        );
      }

      const eventType = eventTypesRepository.findById(eventTypeId);
      if (!eventType) {
        return reply.status(404).send(
          toErrorResponse(new AppError(404, 'not_found', 'Event type not found')),
        );
      }

      const { windowStart, windowEnd } = getBookingWindow();
      const dates = enumerateDates(windowStart, windowEnd);

      const days = dates.map((date) => {
        const bookings = bookingsRepository.findIntervalsByDate(date);
        const slots = buildDaySlots(
          date,
          eventType.durationMinutes,
          bookings,
          (startTime) => isPastSlot(date, startTime),
        );

        const freeSlotCount = countFreeSlots(slots);
        const totalSlotCount = countTotalFutureSlots(slots);

        return {
          date,
          freeSlotCount,
          totalSlotCount,
          isSelectable: freeSlotCount > 0,
        };
      });

      return {
        eventTypeId: eventType.id,
        durationMinutes: eventType.durationMinutes,
        windowStart,
        windowEnd,
        days,
      };
    },
  );
}
