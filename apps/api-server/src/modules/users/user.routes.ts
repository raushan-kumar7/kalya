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
 *
 * @param {UserController} controller - Instantiated user controller handling HTTP logic.
 * @returns {FastifyPluginAsyncZod} Fastify plugin configuring routes with Zod type provider.
 */
export const createUserRoutes = (controller: UserController): FastifyPluginAsyncZod => {
  return async (fastify) => {
    const basePrefix = `/api/${env.app.apiVersion}/users`;

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
    fastify.patch(`${basePrefix}/`, {
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
              scheduledDate: z.date(),
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
