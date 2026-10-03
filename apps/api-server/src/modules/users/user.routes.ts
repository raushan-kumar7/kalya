import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UserController } from './user.controller';
import { env } from '@kalya/env';
import { standardResponseSchema } from '@/responses';
import {
  SessionSchema,
  UpdateProfileSchema,
  UpdateUsernameSchema,
  UserSchema,
  z,
} from '@kalya/validations';

/**
 * Route declarations for user profile and session management endpoints.
 *
 * @description Registers versioned Fastify route endpoints for user profile queries, mutations, avatar uploads, and session management.
 * Trailing-slash variants (`/users` and `/users/`) are handled globally by Fastify's
 * `routerOptions.ignoreTrailingSlash`, so each route is declared exactly once.
 *
 * @param {UserController} controller - Instantiated user controller handling HTTP logic.
 * @returns {FastifyPluginAsyncZod} Fastify plugin configuring routes with Zod type provider.
 */
export const createUserRoutes = (controller: UserController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    const basePrefix = `/api/${env.app.apiVersion}/users`;

    // 0. List / Search Platform Users (Authenticated Only)
    const listUsersConfig = {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['User Profile'],
        summary: 'List or search platform users (authenticated)',
        querystring: z
          .object({
            search: z.string().optional(),
            q: z.string().optional(),
            limit: z.coerce.number().min(1).max(100).optional().default(20),
            offset: z.coerce.number().min(0).optional().default(0),
            // NOTE: z.coerce.boolean() treats "false" as true, so parse the string explicitly.
            includeSelf: z
              .enum(['true', 'false'])
              .optional()
              .default('false')
              .transform((v) => v === 'true'),
          })
          .optional(),
        response: {
          200: standardResponseSchema(z.array(UserSchema)),
        },
      },
      handler: controller.getUsers,
    };

    fastify.get(basePrefix, listUsersConfig);
    // Alias kept for clients calling /users/search; hidden from Swagger to avoid duplicate docs.
    fastify.get(`${basePrefix}/search`, {
      ...listUsersConfig,
      schema: { ...listUsersConfig.schema, hide: true },
    });

    // 1. Get Current User Profile
    fastify.get(`${basePrefix}/me`, {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['User Profile'],
        summary: 'Get current user profile',
        response: {
          200: standardResponseSchema(UserSchema),
        },
      },
      handler: controller.getMe,
    });

    // 2. Update Profile Details
    const updateProfileConfig = {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['User Profile'],
        summary: 'Update user profile details',
        body: UpdateProfileSchema,
        response: {
          200: standardResponseSchema(UserSchema),
        },
      },
      handler: controller.updateMe,
    };

    fastify.patch(basePrefix, updateProfileConfig);
    fastify.patch(`${basePrefix}/me`, {
      ...updateProfileConfig,
      schema: { ...updateProfileConfig.schema, hide: true },
    });

    // 3. Update Username Handle
    fastify.patch(`${basePrefix}/username`, {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['User Profile'],
        summary: 'Update username handle',
        body: UpdateUsernameSchema,
        response: {
          200: standardResponseSchema(UserSchema),
        },
      },
      handler: controller.updateUsername,
    });

    // 4. Suggest Unique Username Handle
    fastify.get(`${basePrefix}/suggest-username`, {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['User Profile'],
        summary: 'Generate unique username suggestion',
        querystring: z
          .object({
            first_name: z.string().optional(),
            last_name: z.string().optional(),
            middle_name: z.string().optional(),
          })
          .optional(),
        response: {
          200: standardResponseSchema(
            z.object({
              username: z.string(),
            })
          ),
        },
      },
      handler: controller.suggestUsername,
    });

    // 5. Upload Profile Avatar (Multipart)
    fastify.post(`${basePrefix}/avatar`, {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['User Profile'],
        summary: 'Upload and optimize profile avatar',
        response: {
          200: standardResponseSchema(UserSchema),
        },
      },
      handler: controller.uploadAvatar,
    });

    // 6. Delete Profile Avatar
    fastify.delete(`${basePrefix}/avatar`, {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['User Profile'],
        summary: 'Remove user profile avatar',
        response: {
          200: standardResponseSchema(UserSchema),
        },
      },
      handler: controller.deleteAvatar,
    });

    // 7. List Active Sessions
    fastify.get(`${basePrefix}/sessions`, {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['User Sessions'],
        summary: 'List active user sessions',
        response: {
          200: standardResponseSchema(z.array(SessionSchema)),
        },
      },
      handler: controller.getSessions,
    });

    // 8. Revoke Specific Session
    fastify.delete(`${basePrefix}/sessions/:sessionId`, {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['User Sessions'],
        summary: 'Revoke specific user session',
        params: z.object({
          sessionId: z.string({ error: 'Session ID is required' }),
        }),
        response: {
          200: standardResponseSchema(
            z.object({
              revoked: z.literal(true),
            })
          ),
        },
      },
      handler: controller.revokeSession,
    });

    // 9. Revoke All Other Sessions
    fastify.post(`${basePrefix}/sessions/revoke-others`, {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['User Sessions'],
        summary: 'Revoke all other active user sessions',
        response: {
          200: standardResponseSchema(
            z.object({
              revokedCount: z.number(),
            })
          ),
        },
      },
      handler: controller.revokeOtherSessions,
    });

    // 10. Schedule Account Deletion
    fastify.post(`${basePrefix}/schedule-deletion`, {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['User Account'],
        summary: 'Schedule account deletion with 14-day grace period',
        response: {
          200: standardResponseSchema(
            z.object({
              // coerce so both Date objects and ISO strings from the controller serialize correctly
              scheduledDate: z.coerce.date(),
              gracePeriodDays: z.number(),
            })
          ),
        },
      },
      handler: controller.scheduleAccountDeletion,
    });

    // 11. Cancel Scheduled Deletion
    fastify.post(`${basePrefix}/cancel-deletion`, {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['User Account'],
        summary: 'Cancel pending account deletion',
        response: {
          200: standardResponseSchema(
            z.object({
              restored: z.boolean(),
            })
          ),
        },
      },
      handler: controller.cancelAccountDeletion,
    });

    // 12. Request Primary Email Change
    fastify.post(`${basePrefix}/request-email-change`, {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['User Account'],
        summary: 'Request email address change with verification link',
        body: z.object({
          newEmail: z.string().email('Invalid email address format'),
        }),
        response: {
          200: standardResponseSchema(
            z.object({
              pending: z.boolean(),
            })
          ),
        },
      },
      handler: controller.requestEmailChange,
    });

    // 13. Admin Broadcast Policy Update
    // TODO: add an admin-role guard (e.g. a `requireAdmin` preHandler) after `authenticate`.
    // Without it, any logged-in user can email every verified user.
    fastify.post(`${basePrefix}/admin/broadcast-policy`, {
      preHandler: [fastify.authenticate],
      schema: {
        tags: ['Admin Compliance'],
        summary: 'Broadcast legal policy update to all verified users',
        body: z.object({
          effectiveDate: z.string(),
          termsUrl: z.string().url().optional(),
          privacyUrl: z.string().url().optional(),
        }),
        response: {
          200: standardResponseSchema(
            z.object({
              totalSent: z.number(),
            })
          ),
        },
      },
      handler: controller.broadcastPolicyUpdate,
    });
  };
};
