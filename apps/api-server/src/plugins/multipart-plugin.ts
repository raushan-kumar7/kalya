import fastifyMultipart from '@fastify/multipart';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

/** Maximum permitted upload file size: 5MB */
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Maximum permitted text field size: 1MB */
const MAX_FIELD_BYTES = 1 * 1024 * 1024;

/**
 * Fastify Multipart upload configuration plugin.
 *
 * @description Configures file upload limits (fileSize: 5MB, 1 file per request, 5 text fields)
 * to mitigate denial-of-service and memory exhaustion attacks.
 */
export const multipartPlugin = fp(
  async (app: FastifyInstance) => {
    await app.register(fastifyMultipart, {
      limits: {
        fileSize: MAX_FILE_BYTES,
        fieldSize: MAX_FIELD_BYTES,
        files: 1,
        fields: 5,
      },
    });
  },
  { name: 'multipart-plugin' }
);
