import { DatabaseClient, schema } from '@kalya/db';
import { env } from '@kalya/env';
import { AUTH_LIMITS } from '@kalya/types';
import { parseDuration } from '@kalya/utils';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer, username } from 'better-auth/plugins';
import { generateUniqueUsername } from '../helpers';

import { AuditLogService } from '../admin';
import {
  handleNewDeviceLogin,
  handlePasswordChanged,
  handleSendResetPassword,
  handleSendVerificationEmail,
  handleWelcomeEmail,
  type SendResetPasswordPayload,
  type SendVerificationEmailPayload,
} from './hooks';

/**
 * Safely parses a human-readable duration string (e.g. "15m", "7d", "24h") into seconds.
 *
 * @param duration - Duration string from environment configuration.
 * @param fallbackSeconds - Fallback duration in seconds if parsing fails or input is undefined.
 * @returns Duration in seconds.
 */
function getDurationInSeconds(duration?: string, fallbackSeconds = 0): number {
  if (!duration) return fallbackSeconds;
  try {
    return Math.floor(parseDuration(duration) / 1000);
  } catch {
    return fallbackSeconds;
  }
}

/**
 * Creates and configures the Better-Auth instance using the existing Fastify Drizzle DB client.
 *
 * @param db - The singleton Drizzle database client initialized by `dbPlugin`.
 * @returns Configured Better-Auth instance.
 */
export const createAuth = (db: DatabaseClient) => {
  // Session lifespan (refresh token lifecycle): total duration the database session remains valid
  const sessionExpiresIn = getDurationInSeconds(
    env.auth.refreshTokenExpiresLife,
    60 * 60 * 24 * 7 // Fallback: 7 days
  );

  // Cookie cache lifespan (access token lifecycle): duration cached session is trusted without DB queries
  const cookieCacheMaxAge = getDurationInSeconds(
    env.auth.accessTokenExpiresLife,
    15 * 60 // Fallback: 15 minutes
  );

  // Update session rolling timestamp in database once every 24 hours (or half session life if shorter)
  const sessionUpdateAge = Math.min(60 * 60 * 24, Math.floor(sessionExpiresIn / 2));

  const auditLogService = new AuditLogService(db);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    secret: env.auth.secretKey,
    baseURL: env.auth.baseUrl || env.app.clientUrl,
    basePath: `/api/${env.app.apiVersion}/auth`,
    trustedOrigins: Array.from(
      new Set(
        [
          ...env.server.corsAllowedOrigins,
          env.app.clientUrl,
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173',
          'https://kalya-iota.vercel.app',
          'https://kalya.vercel.app',
          '*.vercel.app',
          'https://*.vercel.app',
        ].filter(Boolean)
      )
    ),
    socialProviders: {
      google: {
        clientId: env.auth.googleClientId as string,
        clientSecret: env.auth.googleClientSecret as string,
        scope: ['email', 'profile'],
        accessType: 'offline',
        prompt: 'select_account consent',
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google'],
      },
      skipStateCookieCheck: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async (
        data: SendVerificationEmailPayload,
        request?: Request | null
      ) => {
        await handleSendVerificationEmail(data, request);
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: AUTH_LIMITS.MIN_PASSWORD_LENGTH,
      maxPasswordLength: AUTH_LIMITS.MAX_PASSWORD_LENGTH,
      sendResetPassword: async (data: SendResetPasswordPayload, request?: Request | null) => {
        await handleSendResetPassword(data, request);
        await auditLogService.record({
          actorId: data.user.id,
          actorEmail: data.user.email,
          action: 'USER_PASSWORD_RESET_REQUESTED',
          entityType: 'USER',
          entityId: data.user.id,
          severity: 'INFO',
          status: 'SUCCESS',
          description: `Password reset link requested for ${data.user.email}`,
        });
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            // For OAuth sign-ups (Google), Better-Auth populates `name` and `email`
            // but not our custom additionalFields. Fill them in automatically.
            const data = { ...user } as Record<string, unknown>;

            if (!data.first_name && data.name) {
              const nameParts = String(data.name).trim().split(/\s+/);
              data.first_name = nameParts[0] || String(data.name);
              data.last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            }

            // Ensure first_name and last_name are never empty strings
            if (!data.first_name) {
              data.first_name = data.email ? String(data.email).split('@')[0] || 'User' : 'User';
            }
            if (!data.last_name) {
              data.last_name = '';
            }

            // Auto-generate a unique username if not provided (OAuth flow)
            if (!data.username) {
              data.username = await generateUniqueUsername(
                db,
                String(data.first_name),
                String(data.last_name)
              );
            }

            return { data };
          },
          after: async (user) => {
            // OAuth accounts (e.g. Google) have emailVerified=true immediately upon creation
            if (user.emailVerified) {
              await handleWelcomeEmail(db, user);
            }

            await auditLogService.record({
              actorId: user.id,
              actorEmail: user.email,
              action: 'USER_REGISTERED',
              entityType: 'USER',
              entityId: user.id,
              severity: 'INFO',
              status: 'SUCCESS',
              description: `New user registered: ${user.email}`,
              metadata: { name: user.name },
            });
          },
        },
        update: {
          after: async (user) => {
            // Email/password accounts transition emailVerified=true when user clicks verification link
            if (user.emailVerified) {
              await handleWelcomeEmail(db, user);
            }
          },
        },
      },
      session: {
        create: {
          after: async (session, context) => {
            const req = context?.request;
            const ipAddress = session.ipAddress || req?.headers?.get('x-forwarded-for') || null;
            const userAgent = session.userAgent || req?.headers?.get('user-agent') || null;

            await handleNewDeviceLogin(db, {
              userId: session.userId,
              currentSessionId: session.id,
              ipAddress,
              userAgent,
            });

            await auditLogService.record({
              actorId: session.userId,
              action: 'USER_LOGIN',
              entityType: 'SESSION',
              entityId: session.id,
              severity: 'INFO',
              status: 'SUCCESS',
              description: 'User successfully signed in',
              ipAddress,
              userAgent,
            });
          },
        },
      },
      account: {
        update: {
          after: async (account, context) => {
            if (account.password) {
              const req = context?.request;
              const ipAddress = req?.headers?.get('x-forwarded-for') || null;
              const userAgent = req?.headers?.get('user-agent') || null;

              await handlePasswordChanged(db, {
                userId: account.userId,
                ipAddress,
                userAgent,
              });

              await auditLogService.record({
                actorId: account.userId,
                action: 'USER_PASSWORD_CHANGED',
                entityType: 'USER',
                entityId: account.userId,
                severity: 'WARN',
                status: 'SUCCESS',
                description: 'User updated account password',
                ipAddress,
                userAgent,
              });
            }
          },
        },
      },
    },
    plugins: [
      username({
        minUsernameLength: AUTH_LIMITS.MIN_USERNAME_LENGTH,
        maxUsernameLength: AUTH_LIMITS.MAX_USERNAME_LENGTH,
        displayUsernameValidator: (val: string) => val.length <= AUTH_LIMITS.MAX_USERNAME_LENGTH,
      }),
      bearer(),
    ],
    user: {
      additionalFields: {
        first_name: { type: 'string', required: false, input: true },
        last_name: { type: 'string', required: false, input: true },
        middle_name: { type: 'string', required: false, input: true },
        gender: { type: 'string', required: false, input: true },
        dateOfBirth: { type: 'string', required: false, input: true },
        phone: { type: 'string', required: false, input: true },
        locale: { type: 'string', required: false, input: true },
        timezone: { type: 'string', required: false, input: true },
        currency: { type: 'string', required: false, input: true },
        sync_status: { type: 'string', required: false, defaultValue: 'SYNCED' },
        role: { type: 'string', required: false, defaultValue: 'USER', input: false },
        status: { type: 'string', required: false, defaultValue: 'ACTIVE', input: false },
        bannedAt: { type: 'string', required: false, input: false },
        banReason: { type: 'string', required: false, input: false },
        lastActiveAt: { type: 'string', required: false, input: false },
      },
    },
    session: {
      expiresIn: sessionExpiresIn,
      updateAge: sessionUpdateAge,
      cookieCache: {
        enabled: true,
        maxAge: cookieCacheMaxAge,
      },
    },
    advanced: {
      useSecureCookies: env.isProd || env.isStaging,
      // Cross-origin session cookies (Render API + Vercel Web) require SameSite=None and Secure=true.
      defaultCookieAttributes: {
        sameSite: (env.cookie.sameSite || (env.isProd || env.isStaging ? 'none' : 'lax')) as
          'none' | 'lax' | 'strict',
        secure: env.cookie.sameSite === 'none' ? true : env.isProd || env.isStaging,
        ...(env.cookie.domain ? { domain: env.cookie.domain } : {}),
      },
      crossSubdomainCookies: {
        enabled: false,
      },
      ipAddress: {
        ipAddressHeaders: ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'],
      },
    },
  });
};

export type AuthInstance = ReturnType<typeof createAuth>;
