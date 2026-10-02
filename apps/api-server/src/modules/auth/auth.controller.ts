import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthInstance } from './auth.instance';
import type { AuthService } from './auth.service';
import type { CheckAvailabilityDto } from '@kalya/types';
import { ApiResponse } from '@/responses';
import { AppError, InternalServerError } from '@/errors';

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auth: AuthInstance
  ) {}

  /**
   * Handles Better-Auth wildcard requests (/api/v1/auth/*).
   */
  handleAuthRequest = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let requestUrl = request.url;
      if (
        requestUrl.includes('/auth/forget-password') ||
        requestUrl.includes('/auth/forgot-password')
      ) {
        requestUrl = requestUrl.replace(
          /\/auth\/(?:forget|forgot)-password/,
          '/auth/request-password-reset'
        );
      }

      const url = new URL(requestUrl, `http://${request.headers.host}`);

      const response = await this.auth.handler(
        new Request(url.toString(), {
          method: request.method,
          headers: request.headers as HeadersInit,
          body: ['GET', 'HEAD'].includes(request.method) ? undefined : JSON.stringify(request.body),
        })
      );

      reply.status(response.status);
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      const responseText = await response.text();
      try {
        return reply.send(JSON.parse(responseText));
      } catch {
        return reply.send(responseText);
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new InternalServerError(
        'Authentication service encountered an unexpected error',
        'AUTH_INTERNAL_ERROR',
        undefined,
        err
      );
    }
  };

  /**
   * Handles real-time availability checks (/api/${env.app.apiVersion}/auth/check-availability).
   */
  checkAvailability = async (
    request: FastifyRequest<{ Querystring: CheckAvailabilityDto }>,
    reply: FastifyReply
  ) => {
    const result = await this.authService.checkAvailability(request.query);
    return ApiResponse.ok(reply, result, result.message);
  };
}
