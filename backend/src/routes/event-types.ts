import type { FastifyInstance } from 'fastify';
import { AppError, toErrorResponse } from '../errors.js';
import { durationFitsWorkday } from '../domain/slots.js';
import { validateEventTypeInput } from '../domain/validation.js';
import { eventTypesRepository } from '../repositories/event-types.js';
import { bookingsRepository } from '../repositories/bookings.js';

interface CreateEventTypeBody {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

interface UpdateEventTypeBody {
  name: string;
  description: string;
  durationMinutes: number;
}

export async function eventTypesRoutes(app: FastifyInstance): Promise<void> {
  app.get('/event-types', async () => {
    const items = eventTypesRepository.list();
    return { items, total: items.length };
  });

  app.get<{ Params: { eventTypeId: string } }>(
    '/event-types/:eventTypeId',
    async (request, reply) => {
      const eventType = eventTypesRepository.findById(request.params.eventTypeId);
      if (!eventType) {
        return reply.status(404).send(
          toErrorResponse(new AppError(404, 'not_found', 'Event type not found')),
        );
      }
      return eventType;
    },
  );

  app.post<{ Body: CreateEventTypeBody }>('/event-types', async (request, reply) => {
    const body = request.body;
    const errors = validateEventTypeInput(body, { requireId: true });

    if (errors.length > 0) {
      return reply.status(400).send(
        toErrorResponse(
          new AppError(400, 'validation_error', errors.join('; '), { errors }),
        ),
      );
    }

    if (!durationFitsWorkday(body.durationMinutes)) {
      return reply.status(400).send(
        toErrorResponse(
          new AppError(
            400,
            'validation_error',
            'durationMinutes must allow at least one slot within working hours',
          ),
        ),
      );
    }

    if (eventTypesRepository.findById(body.id)) {
      return reply.status(409).send(
        toErrorResponse(
          new AppError(409, 'duplicate_id', 'Event type with this id already exists'),
        ),
      );
    }

    const eventType = eventTypesRepository.create({
      id: body.id.trim(),
      name: body.name.trim(),
      description: body.description ?? '',
      durationMinutes: body.durationMinutes,
      createdAt: new Date().toISOString(),
    });

    return reply.status(201).send(eventType);
  });

  app.patch<{ Params: { eventTypeId: string }; Body: UpdateEventTypeBody }>(
    '/event-types/:eventTypeId',
    async (request, reply) => {
      const existing = eventTypesRepository.findById(request.params.eventTypeId);
      if (!existing) {
        return reply.status(404).send(
          toErrorResponse(new AppError(404, 'not_found', 'Event type not found')),
        );
      }

      const body = request.body;
      const errors = validateEventTypeInput(body, { requireId: false });

      if (errors.length > 0) {
        return reply.status(400).send(
          toErrorResponse(
            new AppError(400, 'validation_error', errors.join('; '), { errors }),
          ),
        );
      }

      if (!durationFitsWorkday(body.durationMinutes)) {
        return reply.status(400).send(
          toErrorResponse(
            new AppError(
              400,
              'validation_error',
              'durationMinutes must allow at least one slot within working hours',
            ),
          ),
        );
      }

      const eventType = eventTypesRepository.update(request.params.eventTypeId, {
        name: body.name.trim(),
        description: body.description ?? '',
        durationMinutes: body.durationMinutes,
      });

      return eventType!;
    },
  );

  app.delete<{ Params: { eventTypeId: string } }>(
    '/event-types/:eventTypeId',
    async (request, reply) => {
      const existing = eventTypesRepository.findById(request.params.eventTypeId);
      if (!existing) {
        return reply.status(404).send(
          toErrorResponse(new AppError(404, 'not_found', 'Event type not found')),
        );
      }

      if (bookingsRepository.hasUpcomingByEventTypeId(request.params.eventTypeId)) {
        return reply.status(409).send(
          toErrorResponse(
            new AppError(
              409,
              'has_upcoming_bookings',
              'Cannot delete event type with upcoming bookings',
            ),
          ),
        );
      }

      eventTypesRepository.delete(request.params.eventTypeId);
      return reply.status(204).send();
    },
  );
}
