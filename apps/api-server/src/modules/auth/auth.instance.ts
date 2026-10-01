import { DatabaseClient, schema } from '@kalya/db';
import { env } from '@kalya/env';
import { AUTH_LIMITS } from '@kalya/types';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';
import { generateUniqueUsername } from '../helpers';

import {
  handleNewDeviceLogin,
  handlePasswordChanged,
  handleSendResetPassword,
  handleSendVerificationEmail,
  type SendResetPasswordPayload,
  type SendVerificationEmailPayload,
} from './hooks';

/**
 * Creates and configures the Better-Auth instance using the existing Fastify Drizzle DB client.
 *
 * @param db - The singleton Drizzle database client initialized by `dbPlugin`.
 * @returns Configured Better-Auth instance.
 */
export const createAuth = (db: DatabaseClient) => {
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
    socialProviders: {
      google: {
        clientId: env.auth.googleClientId as string,
        clientSecret: env.auth.googleClientSecret as string,
        scope: ['email', 'profile'],
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google'],
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: AUTH_LIMITS.MIN_PASSWORD_LENGTH,
      maxPasswordLength: AUTH_LIMITS.MAX_PASSWORD_LENGTH,
      sendVerificationEmail: async (
        data: SendVerificationEmailPayload,
        request?: Request | null
      ) => {
        await handleSendVerificationEmail(data, request);
      },
      sendResetPassword: async (data: SendResetPasswordPayload, request?: Request | null) => {
        await handleSendResetPassword(data, request);
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
          },
        },
      },
      account: {
        update: {
          after: async (account, context) => {
            if (account.password) {
              const req = context?.request;
              await handlePasswordChanged(db, {
                userId: account.userId,
                ipAddress: req?.headers?.get('x-forwarded-for') || null,
                userAgent: req?.headers?.get('user-agent') || null,
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
    ],
    user: {
      additionalFields: {
        first_name: { type: 'string', required: true, input: true },
        last_name: { type: 'string', required: true, input: true },
        middle_name: { type: 'string', required: false, input: true },
        gender: { type: 'string', required: false, input: true },
        dateOfBirth: { type: 'string', required: false, input: true },
        phone: { type: 'string', required: false, input: true },
        locale: { type: 'string', required: false, input: true },
        timezone: { type: 'string', required: false, input: true },
        currency: { type: 'string', required: false, input: true },
        sync_status: { type: 'string', required: false, defaultValue: 'SYNCED' },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
    },
    advanced: {
      useSecureCookies: env.isProd,
      crossSubdomainCookies: {
        enabled: false,
      },
    },
  });
};

export type AuthInstance = ReturnType<typeof createAuth>;
