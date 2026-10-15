import { env } from '@kalya/env';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

const KALYA_LOGO_URL =
  'https://res.cloudinary.com/cloud-alpha/image/upload/v1784056067/kalya/kalya_logo_yxp1fz.png';
const KALYA_ICON_URL =
  'https://res.cloudinary.com/cloud-alpha/image/upload/v1784056074/kalya/kalya_icon_n6webd.png';

/**
 * Swagger & OpenAPI 3.1 documentation plugin.
 *
 * @description Registers @fastify/swagger and @fastify/swagger-ui using standard Fastify
 * Swagger UI defaults, updating only the documentation title and Kalya brand logo.
 */
export const swaggerPlugin = fp(
  async (app: FastifyInstance) => {
    // Disable Swagger & OpenAPI documentation in production by default to prevent exposing API endpoints
    const isDocsEnabled = !env.isProd || process.env.KALYA_DOCS_ENABLED === 'true';

    if (!isDocsEnabled) {
      return;
    }

    // 1. Core Swagger / OpenAPI Specification Generator
    await app.register(swagger, {
      openapi: {
        openapi: '3.1.0',
        info: {
          title: 'Kalya API',
          description:
            'Personal finance platform REST API & Split Bills engine for Kalya web and mobile clients.',
          version: '1.0.0',
          contact: {
            name: 'Kalya Engineering',
          },
        },
        servers: [
          {
            url: `http://localhost:${env.server.port}`,
            description: 'Local Development Server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Bearer JWT token for authenticated endpoints.',
            },
            cookieAuth: {
              type: 'apiKey',
              in: 'cookie',
              name: 'kalya.session_token',
              description: 'Session cookie managed by Better-Auth.',
            },
          },
        },
      },
      transform: (param) => {
        const { schema, url } = param;
        // Suppress wildcard internal routes or routes explicitly marked hide
        if (
          url.endsWith('/*') ||
          url.includes('/api/v1/auth/*') ||
          (schema as Record<string, unknown>)?.hide === true
        ) {
          return {
            schema: { ...(schema as Record<string, unknown>), hide: true },
            url,
          };
        }
        return jsonSchemaTransform(param);
      },
    });

    // 2. Interactive Swagger UI
    await app.register(swaggerUi, {
      routePrefix: '/docs',
      theme: {
        title: 'Kalya API',
        css: [
          {
            filename: 'logo.css',
            content: `
                .swagger-ui .topbar-wrapper img {
                  content: url('${KALYA_LOGO_URL}') !important;
                  height: 40px !important;
                  width: auto !important;
                }
            `.trim(),
          },
        ],
        js: [
          {
            filename: 'logo.js',
            content: `
              window.addEventListener('DOMContentLoaded', function () {
                var setAssets = function () {
                  var img = document.querySelector('.topbar-wrapper a img');
                  if (img && img.src !== '${KALYA_LOGO_URL}') {
                    img.src = '${KALYA_LOGO_URL}';
                  }
                  var favicon = document.querySelector("link[rel*='icon']");
                  if (favicon && favicon.href !== '${KALYA_ICON_URL}') {
                    favicon.href = '${KALYA_ICON_URL}';
                  }
                };
                setAssets();
                new MutationObserver(setAssets).observe(document.documentElement, { childList: true, subtree: true });
              });
            `.trim(),
          },
        ],
      },
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
      },
      staticCSP: true,
      transformStaticCSP: (header) => {
        return header.replace("img-src 'self'", "img-src 'self' https://res.cloudinary.com");
      },
    });
  },
  { name: 'swagger-plugin' }
);
