// import { db } from "@/db";
// import * as schema from "@/db/schema";
// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { GENDER_OPTIONS, SYNC_STATUS_OPTIONS } from "./constants/user";
// import { sendMail } from "./mailer";
// import VerifyEmail from "@/emails/verify-email";
// import Welcome from "@/emails/welcome";
// import ResetPassword from "@/emails/reset-password";
// import { APIError, createAuthMiddleware } from "better-auth/api";
// import { extractIp, getLocationFromIp, parseDevice } from "@/utils/request-info";
// import SigninAlert from "@/emails/signin-alert";
// import { formatDateTime } from "@/utils/datetime";
// import PasswordChanged from "@/emails/password-changed";
// import { username } from "better-auth/plugins";
// import { nextCookies } from "better-auth/next-js";

// export const auth = betterAuth({
//   database: drizzleAdapter(db, { provider: "sqlite", schema }),

//   emailVerification: {
//     sendOnSignUp: true,
//     autoSignInAfterVerification: false,
//     sendVerificationEmail: async ({ user, url }) => {
//       await sendMail({
//         to: user.email,
//         subject: "Verify your email",
//         react: VerifyEmail({ name: user.name, verifyUrl: url }),
//       });
//     },
//     afterEmailVerification: async (user) => {
//       await sendMail({
//         to: user.email,
//         subject: "Welcome to Kalya",
//         react: Welcome({ name: user.name }),
//       });
//     },
//   },

//   emailAndPassword: {
//     enabled: true,
//     requireEmailVerification: false,
//     minPasswordLength: 8,
//     sendResetPassword: async ({ user, url }) => {
//       await sendMail({
//         to: user.email,
//         subject: "Reset your password",
//         react: ResetPassword({ name: user.email, resetUrl: url }),
//       });
//     },
//   },

//   user: {
//     additionalFields: {
//       username: {
//         type: "string",
//         required: true,
//         unique: true,
//       },
//       first_name: {
//         type: "string",
//         required: true,
//       },
//       middle_name: {
//         type: "string",
//         required: false,
//       },
//       last_name: {
//         type: "string",
//         required: true,
//       },
//       gender: {
//         type: [...GENDER_OPTIONS],
//         required: false,
//       },
//       date_of_birth: {
//         type: "string",
//         required: false,
//       },
//       phone: {
//         type: "string",
//         required: false,
//       },
//       locale: {
//         type: "string",
//         required: false,
//       },
//       timezone: {
//         type: "string",
//         required: false,
//       },
//       currency: {
//         type: "string",
//         required: false,
//       },
//       sync_status: {
//         type: [...SYNC_STATUS_OPTIONS],
//         required: false,
//         defaultValue: "SYNCED",
//         input: false,
//       },
//     },

//     session: {
//       expiresIn: 60 * 60 * 24 * 30,
//       disableSessionRefresh: true,
//       freshAge: 60 * 60 * 24,
//     },
//   },

//   hooks: {
//     after: createAuthMiddleware(async (ctx) => {
//       // Prevent emails from sending if the API request failed.
//       // `ctx.context.returned` holds either the successful payload/Response,
//       // or an APIError instance if the request failed.
//       const returned = ctx.context.returned;

//       if (returned instanceof APIError) return;
//       if (returned instanceof Response && returned.status >= 400) return;

//       const path = ctx.path;

//       // 1. Handle New Sign-Ins
//       if (path === "/sign-in/email" || path === "/sign-in/username") {
//         const user = ctx.context.newSession?.user;
//         if (!user) return;

//         const ip = extractIp(ctx.headers);
//         const { label: location } = await getLocationFromIp(ip);
//         const { browser, os } = parseDevice(ctx.headers?.get("user-agent"));

//         void sendMail({
//           to: user.email,
//           subject: "New sign-in to your account",
//           react: SigninAlert({
//             name: user.name,
//             timestamp: formatDateTime(new Date(), user.timezone), // Assuming timezone from user
//             device: `${browser} on ${os}`,
//             location,
//             ipAddress: ip,
//           }),
//         });
//         return;
//       }

//       // 2. Handle Password Changes
//       if (path === "/change-password" || path === "/reset-password") {
//         // "/change-password" requires an active session.
//         // "/reset-password" populates the user in context upon a successful reset.
//         const user = ctx.context.session?.user || ctx.context.user;

//         if (!user) return;

//         const ip = extractIp(ctx.headers);
//         const { label: location } = await getLocationFromIp(ip);
//         const { browser, os } = parseDevice(ctx.headers?.get("user-agent"));

//         void sendMail({
//           to: user.email,
//           subject: "Your password was successfully changed",
//           react: PasswordChanged({
//             name: user.name,
//             timestamp: formatDateTime(new Date(), user.timezone),
//             device: `${browser} on ${os}`,
//             location,
//           }),
//         });
//         return;
//       }
//     }),
//   },

//   plugins: [username(), nextCookies()],
// });

// export type Auth = typeof auth;

import { db } from "@/db";
import * as schema from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { GENDER_OPTIONS, SYNC_STATUS_OPTIONS } from "./constants/user";
import { sendMail } from "./mailer";
import VerifyEmail from "@/emails/verify-email";
import Welcome from "@/emails/welcome";
import ResetPassword from "@/emails/reset-password";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { extractIp, getLocationFromIp, parseDevice } from "@/utils/request-info";
import SigninAlert from "@/emails/signin-alert";
import { formatDateTime } from "@/utils/datetime";
import PasswordChanged from "@/emails/password-changed";
import { username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

/**
 * better-auth's built-in User type only knows the core fields — it has no
 * awareness of `additionalFields` (timezone, first_name, etc.) because,
 * inside this very file, we can't reference the `Auth`-inferred type without
 * a circular dependency. We assert against the Drizzle row type instead,
 * which does know about every column.
 */
type AppUser = typeof schema.user.$inferSelect;

/**
 * `/reset-password` is an unauthenticated flow — the user proves identity via
 * a one-time token, not a session. better-auth does NOT populate
 * ctx.context.session/user for this endpoint, so we resolve the token to a
 * user in the `before` hook (while the verification row is still readable)
 * and hand it to the `after` hook once the reset actually succeeds.
 *
 * Keyed by token, single-use, with a TTL sweep so a request that errors out
 * mid-flow can't leak an entry forever.
 */
type CachedResetUser = {
  email: string;
  name: string;
  timezone?: string;
  cachedAt: number;
};

const RESET_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min — generous vs. request latency
const resetPasswordUserCache = new Map<string, CachedResetUser>();

function pruneExpiredCacheEntries() {
  const now = Date.now();
  for (const [token, entry] of resetPasswordUserCache) {
    if (now - entry.cachedAt > RESET_CACHE_TTL_MS) {
      resetPasswordUserCache.delete(token);
    }
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema }),

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Verify your email",
        react: VerifyEmail({ name: user.name, verifyUrl: url }),
      });
    },
    afterEmailVerification: async (user) => {
      await sendMail({
        to: user.email,
        subject: "Welcome to Kalya",
        react: Welcome({ name: user.name }),
      });
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Reset your password",
        react: ResetPassword({ name: user.email, resetUrl: url }),
      });
    },
  },

  user: {
    additionalFields: {
      username: {
        type: "string",
        required: true,
        unique: true,
      },
      first_name: {
        type: "string",
        required: true,
      },
      middle_name: {
        type: "string",
        required: false,
      },
      last_name: {
        type: "string",
        required: true,
      },
      gender: {
        type: [...GENDER_OPTIONS],
        required: false,
      },
      date_of_birth: {
        type: "string",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      locale: {
        type: "string",
        required: false,
      },
      timezone: {
        type: "string",
        required: false,
      },
      currency: {
        type: "string",
        required: false,
      },
      sync_status: {
        type: [...SYNC_STATUS_OPTIONS],
        required: false,
        defaultValue: "SYNCED",
        input: false,
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 30,
      disableSessionRefresh: true,
      freshAge: 60 * 60 * 24,
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/reset-password") return;

      const token = ctx.body?.token as string | undefined;
      if (!token) return;

      pruneExpiredCacheEntries();

      try {
        // Read the verification row BEFORE the endpoint consumes/deletes it.
        const verification = await ctx.context.internalAdapter.findVerificationValue(token);
        if (!verification) return;

        const user = (await ctx.context.internalAdapter.findUserById(
          verification.value
        )) as AppUser | null;
        if (!user) return;

        resetPasswordUserCache.set(token, {
          email: user.email,
          name: user.name,
          timezone: user.timezone ?? undefined,
          cachedAt: Date.now(),
        });
      } catch (err) {
        // Never let email-notification plumbing break the actual reset flow.
        console.error("Failed to pre-resolve reset-password user:", err);
      }
    }),

    after: createAuthMiddleware(async (ctx) => {
      // `ctx.context.returned` is either the successful payload/Response,
      // or an APIError if the request failed — skip notifying on failure.
      const returned = ctx.context.returned;
      if (returned instanceof APIError) return;
      if (returned instanceof Response && returned.status >= 400) return;

      const path = ctx.path;

      // 1. New sign-in alert
      if (path === "/sign-in/email" || path === "/sign-in/username") {
        const user = ctx.context.newSession?.user as AppUser | undefined;
        if (!user) return;

        const ip = extractIp(ctx.headers);
        const { label: location } = await getLocationFromIp(ip);
        const { browser, os } = parseDevice(ctx.headers?.get("user-agent"));

        void sendMail({
          to: user.email,
          subject: "New sign-in to your account",
          react: SigninAlert({
            name: user.name,
            timestamp: formatDateTime(new Date(), user.timezone ?? undefined),
            device: `${browser} on ${os}`,
            location,
            ipAddress: ip,
          }),
        }).catch((err) => console.error("Failed to send sign-in alert:", err));
        return;
      }

      // 2a. Password changed — authenticated flow, session is available directly.
      if (path === "/change-password") {
        const user = ctx.context.session?.user as AppUser | undefined;
        if (!user) return;

        const ip = extractIp(ctx.headers);
        const { label: location } = await getLocationFromIp(ip);
        const { browser, os } = parseDevice(ctx.headers?.get("user-agent"));

        void sendMail({
          to: user.email,
          subject: "Your password was successfully changed",
          react: PasswordChanged({
            name: user.name,
            timestamp: formatDateTime(new Date(), user.timezone ?? undefined),
            device: `${browser} on ${os}`,
            location,
          }),
        }).catch((err) => console.error("Failed to send password-changed email:", err));
        return;
      }

      // 2b. Password reset — unauthenticated flow, use the user resolved in `before`.
      if (path === "/reset-password") {
        const token = ctx.body?.token as string | undefined;
        const cachedUser = token ? resetPasswordUserCache.get(token) : undefined;
        if (!cachedUser) return;

        resetPasswordUserCache.delete(token!); // one-shot: never reuse a token's cache entry

        const ip = extractIp(ctx.headers);
        const { label: location } = await getLocationFromIp(ip);
        const { browser, os } = parseDevice(ctx.headers?.get("user-agent"));

        void sendMail({
          to: cachedUser.email,
          subject: "Your password was successfully changed",
          react: PasswordChanged({
            name: cachedUser.name,
            timestamp: formatDateTime(new Date(), cachedUser.timezone),
            device: `${browser} on ${os}`,
            location,
          }),
        }).catch((err) => console.error("Failed to send reset-password confirmation:", err));
        return;
      }
    }),
  },

  plugins: [username(), nextCookies()],
});

export type Auth = typeof auth;
