import type { FastifyInstance } from 'fastify';
import { AppError, toErrorResponse } from '../errors.js';
import { buildDaySlots } from '../domain/slots.js';
import { isDateInWindow, isPastSlot } from '../domain/time.js';
import { isValidDate } from '../domain/validation.js';
import { bookingsRepository } from '../repositories/bookings.js';
import { eventTypesRepository } from '../repositories/event-types.js';

export async function daysRoutes(app: FastifyInstance): Promise<void> {
  app.get<{
    Params: { date: string };
    Querystring: { eventTypeId?: string };
  }>('/days/:date/slots', async (request, reply) => {
    const { date } = request.params;
    const { eventTypeId } = request.query;

    if (!eventTypeId) {
      return reply.status(400).send(
        toErrorResponse(new AppError(400, 'validation_error', 'eventTypeId is required')),
      );
    }

    if (!isValidDate(date)) {
      return reply.status(400).send(
        toErrorResponse(new AppError(400, 'validation_error', 'date must be YYYY-MM-DD')),
      );
    }

    if (!isDateInWindow(date)) {
      return reply.status(400).send(
        toErrorResponse(
          new AppError(400, 'validation_error', 'date must be within the 14-day booking window'),
        ),
      );
    }

    const eventType = eventTypesRepository.findById(eventTypeId);
    if (!eventType) {
      return reply.status(404).send(
        toErrorResponse(new AppError(404, 'not_found', 'Event type not found')),
      );
    }

    const bookings = bookingsRepository.findIntervalsByDate(date);
    const slots = buildDaySlots(
      date,
      eventType.durationMinutes,
      bookings,
      (startTime) => isPastSlot(date, startTime),
    );

    return {
      eventTypeId: eventType.id,
      date,
      durationMinutes: eventType.durationMinutes,
      slots,
    };
  });
}
