import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '@kalya/env';
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

      const rawProto = request.headers['x-forwarded-proto'];
      const protocol =
        typeof rawProto === 'string' ? rawProto.split(',')[0].trim() : request.protocol || 'http';

      const url = new URL(requestUrl, `${protocol}://${request.headers.host}`);

      const headers = new Headers(request.headers as HeadersInit);
      if (!headers.get('x-forwarded-for') && request.ip) {
        headers.set('x-forwarded-for', request.ip);
      }
      if (!headers.get('x-forwarded-proto')) {
        headers.set('x-forwarded-proto', protocol);
      }
      if (!headers.get('x-forwarded-host') && request.headers.host) {
        headers.set('x-forwarded-host', request.headers.host);
      }

      const response = await this.auth.handler(
        new Request(url.toString(), {
          method: request.method,
          headers,
          body: ['GET', 'HEAD'].includes(request.method) ? undefined : JSON.stringify(request.body),
        })
      );

      reply.status(response.status);

      // Forward Set-Cookie headers properly. In Node 18+, response.headers.getSetCookie()
      // returns an array of individual cookie strings so Fastify can emit multiple Set-Cookie headers
      // rather than overwriting each or joining them with commas.
      const getSetCookie = (response.headers as any).getSetCookie;
      let setCookies: string[] = [];
      if (typeof getSetCookie === 'function') {
        const rawCookies = getSetCookie.call(response.headers);
        if (Array.isArray(rawCookies)) {
          setCookies = rawCookies;
        }
      } else {
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
          setCookies = [setCookie];
        }
      }

      if (setCookies.length > 0) {
        reply.header('set-cookie', setCookies);
      }

      // Cross-Domain OAuth Redirect Enhancement:
      // When Better-Auth finishes an OAuth callback (status 301/302/303/307) and redirects
      // to the frontend client URL (e.g. https://kalya-iota.vercel.app/dashboard),
      // modern browsers (Safari ITP, Firefox Total Cookie Protection, Chrome 3rd-party cookie deprecation)
      // will NOT send cookies set by onrender.com when making cross-origin requests from vercel.app.
      // We extract the session token from Set-Cookie and append ?token= to the redirect URL
      // so the frontend can immediately hydrate its session and authenticate via Bearer token!
      let redirectLocation = response.headers.get('location');
      if (
        (response.status === 302 ||
          response.status === 301 ||
          response.status === 303 ||
          response.status === 307) &&
        redirectLocation
      ) {
        let sessionToken: string | null = null;
        for (const cookieStr of setCookies) {
          const match = cookieStr.match(
            /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=([^;]+)/
          );
          if (match) {
            sessionToken = decodeURIComponent(match[1]);
            break;
          }
        }

        if (sessionToken && redirectLocation.startsWith('http')) {
          try {
            const redirectUrl = new URL(redirectLocation);
            const allowedOrigins = [
              new URL(env.app.clientUrl).origin,
              ...env.server.corsAllowedOrigins.map((o) => {
                try {
                  return new URL(o).origin;
                } catch {
                  return o;
                }
              }),
              'http://localhost:3000',
            ];

            const isAllowed =
              allowedOrigins.includes(redirectUrl.origin) ||
              redirectUrl.hostname.endsWith('.vercel.app');

            if (isAllowed) {
              if (!redirectUrl.searchParams.has('token')) {
                redirectUrl.searchParams.set('token', sessionToken);
                redirectLocation = redirectUrl.toString();
              }
            }
          } catch {
            // Keep original location on URL parse error
          }
        }
      }

      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'set-cookie' && key.toLowerCase() !== 'location') {
          reply.header(key, value);
        }
      });

      // ONLY set location header if this is actually a 3xx redirect response.
      // Better-Auth internally sets a Location header even on 200 OK responses when disableRedirect is false.
      // Emitting Location on a 200 response confuses browser fetch/XHR into attempting CORS redirects against accounts.google.com!
      if (redirectLocation && response.status >= 300 && response.status < 400) {
        reply.header('location', redirectLocation);
      }

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
