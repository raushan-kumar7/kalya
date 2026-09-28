import { DatabaseClient, schema } from '@kalya/db';
import { env } from '@kalya/env';
import { AUTH_LIMITS } from '@kalya/types';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';

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
    basePath: '/api/auth',
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: AUTH_LIMITS.MIN_PASSWORD_LENGTH,
      maxPasswordLength: AUTH_LIMITS.MAX_PASSWORD_LENGTH,
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
