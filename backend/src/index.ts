import cors from '@fastify/cors';
import Fastify from 'fastify';
import { config } from './config.js';
import { AppError, toErrorResponse } from './errors.js';
import { getDb } from './db/connection.js';
import { healthRoutes } from './routes/health.js';
import { eventTypesRoutes } from './routes/event-types.js';
import { bookingsRoutes } from './routes/bookings.js';
import { calendarRoutes } from './routes/calendar.js';
import { daysRoutes } from './routes/days.js';
import { registerStatic } from './static.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send(toErrorResponse(error));
  }

  app.log.error(error);
  return reply.status(500).send(
    toErrorResponse(new AppError(500, 'internal_error', 'Internal server error')),
  );
});

await app.register(healthRoutes);
await app.register(eventTypesRoutes);
await app.register(bookingsRoutes);
await app.register(calendarRoutes);
await app.register(daysRoutes);
await registerStatic(app);

getDb();

try {
  await app.listen({ port: config.port, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
