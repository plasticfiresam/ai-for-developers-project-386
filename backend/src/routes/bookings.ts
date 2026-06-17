import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { runInTransaction } from '../db/connection.js';
import { AppError, toErrorResponse } from '../errors.js';
import {
  computeEndTime,
  hasOverlap,
  isValidSlotStart,
} from '../domain/slots.js';
import {
  getToday,
  isDateInWindow,
  isPastSlot,
} from '../domain/time.js';
import { isValidDate, isValidTime, isValidUuid } from '../domain/validation.js';
import { bookingsRepository } from '../repositories/bookings.js';
import { eventTypesRepository } from '../repositories/event-types.js';

interface CreateBookingBody {
  guestId: string;
  eventTypeId: string;
  date: string;
  startTime: string;
}

export async function bookingsRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: CreateBookingBody }>('/bookings', async (request, reply) => {
    const body = request.body;

    if (!body.guestId || !isValidUuid(body.guestId)) {
      return reply.status(400).send(
        toErrorResponse(new AppError(400, 'validation_error', 'guestId must be a valid UUID')),
      );
    }

    if (!body.eventTypeId) {
      return reply.status(400).send(
        toErrorResponse(new AppError(400, 'validation_error', 'eventTypeId is required')),
      );
    }

    if (!body.date || !isValidDate(body.date)) {
      return reply.status(400).send(
        toErrorResponse(new AppError(400, 'validation_error', 'date must be YYYY-MM-DD')),
      );
    }

    if (!body.startTime || !isValidTime(body.startTime)) {
      return reply.status(400).send(
        toErrorResponse(new AppError(400, 'validation_error', 'startTime must be HH:mm')),
      );
    }

    if (body.date < getToday()) {
      return reply.status(400).send(
        toErrorResponse(new AppError(400, 'validation_error', 'date must not be in the past')),
      );
    }

    if (!isDateInWindow(body.date)) {
      return reply.status(400).send(
        toErrorResponse(
          new AppError(400, 'validation_error', 'date must be within the 14-day booking window'),
        ),
      );
    }

    try {
      const booking = runInTransaction(() => {
        const eventType = eventTypesRepository.findById(body.eventTypeId);
        if (!eventType) {
          throw new AppError(404, 'not_found', 'Event type not found');
        }

        if (!isValidSlotStart(body.startTime, eventType.durationMinutes)) {
          throw new AppError(
            400,
            'validation_error',
            'startTime is not a valid slot for this event type',
          );
        }

        if (isPastSlot(body.date, body.startTime)) {
          throw new AppError(400, 'validation_error', 'startTime must not be in the past');
        }

        const endTime = computeEndTime(body.startTime, eventType.durationMinutes);
        const existingIntervals = bookingsRepository.findIntervalsByDate(body.date);

        if (hasOverlap(body.startTime, endTime, existingIntervals)) {
          throw new AppError(409, 'slot_conflict', 'This time slot is already booked');
        }

        return bookingsRepository.create({
          id: randomUUID(),
          guestId: body.guestId,
          eventTypeId: eventType.id,
          eventTypeName: eventType.name,
          date: body.date,
          startTime: body.startTime,
          durationMinutes: eventType.durationMinutes,
          endTime,
          createdAt: new Date().toISOString(),
        });
      });

      return reply.status(201).send(booking);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send(toErrorResponse(error));
      }
      throw error;
    }
  });

  app.get<{ Querystring: { guestId?: string; upcoming?: string } }>(
    '/bookings',
    async (request, reply) => {
      const { guestId, upcoming = 'true' } = request.query;

      if (!guestId) {
        return reply.status(400).send(
          toErrorResponse(new AppError(400, 'validation_error', 'guestId is required')),
        );
      }

      if (!isValidUuid(guestId)) {
        return reply.status(400).send(
          toErrorResponse(new AppError(400, 'validation_error', 'guestId must be a valid UUID')),
        );
      }

      const upcomingOnly = upcoming !== 'false';
      const items = bookingsRepository.listByGuest(guestId, upcomingOnly);
      return { items, total: items.length };
    },
  );

  app.get('/bookings/upcoming', async () => {
    const items = bookingsRepository.listUpcoming();
    return { items, total: items.length };
  });

  app.get<{ Params: { bookingId: string } }>(
    '/bookings/:bookingId',
    async (request, reply) => {
      if (!isValidUuid(request.params.bookingId)) {
        return reply.status(404).send(
          toErrorResponse(new AppError(404, 'not_found', 'Booking not found')),
        );
      }

      const booking = bookingsRepository.findById(request.params.bookingId);
      if (!booking) {
        return reply.status(404).send(
          toErrorResponse(new AppError(404, 'not_found', 'Booking not found')),
        );
      }

      return booking;
    },
  );
}
