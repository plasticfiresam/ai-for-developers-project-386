import { existsSync } from 'node:fs';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';
import { AppError, toErrorResponse } from './errors.js';
import { config } from './config.js';

export async function registerStatic(app: FastifyInstance): Promise<void> {
  const { staticDir } = config;

  if (!staticDir || !existsSync(staticDir)) {
    return;
  }

  await app.register(fastifyStatic, {
    root: staticDir,
    wildcard: false,
  });

  app.setNotFoundHandler((request, reply) => {
    if (request.method === 'GET') {
      return reply.sendFile('index.html', staticDir);
    }

    return reply
      .status(404)
      .send(toErrorResponse(new AppError(404, 'not_found', 'Not found')));
  });
}
