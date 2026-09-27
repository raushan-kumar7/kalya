import { config } from '@/configs';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Static asset serving plugin for local storage mode.
 *
 * @description Serves uploaded assets from the configured local directory at `/uploads/`.
 * Ensures the destination directory exists prior to registration to prevent startup crashes.
 */
export const staticFilesPlugin = fp(
  async (app: FastifyInstance) => {
    if (config.storage.provider !== 'local') return;

    const uploadDir = path.resolve(process.cwd(), config.storage.local.uploadDir);

    // Ensure the upload directory exists on disk to prevent @fastify/static ENOENT crash
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    await app.register(fastifyStatic, {
      root: uploadDir,
      prefix: '/uploads/',
      decorateReply: false,
      maxAge: '30d',
      immutable: true,
      dotfiles: 'ignore',
    });
  },
  { name: 'static-files-plugin' }
);
