import { env } from '@kalya/env';
import helmet from '@fastify/helmet';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

/**
 * Builds API-specific Content Security Policy and security headers options for Helmet.
 *
 * @param {boolean} isLocal - True if running in local development.
 * @returns {object} Helmet configuration options.
 */
const buildAPICSP = (isLocal: boolean) => ({
  crossOriginResourcePolicy: { policy: 'cross-origin' as const },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'validator.swagger.io', 'https://res.cloudinary.com'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: isLocal ? null : [],
    },
  },
  hsts: isLocal ? false : { maxAge: 31_536_000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' as const },
});

/**
 * Security headers plugin.
 *
 * @description Configures Helmet with strict API security policies (CSP, HSTS, referrer policy)
 * and strips X-Powered-By fingerprint headers from HTTP responses.
 */
export const securityPlugin = fp(
  async (app: FastifyInstance) => {
    const isLocal = env.isDev;

    await app.register(helmet, buildAPICSP(isLocal));

    // Strip server fingerprinting headers
    app.addHook('onSend', async (_request, reply, payload) => {
      reply.removeHeader('x-powered-by');
      reply.removeHeader('X-Powered-By');
      return payload;
    });
  },
  { name: 'security-plugin' }
);
