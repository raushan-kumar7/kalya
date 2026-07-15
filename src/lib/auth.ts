// import { db } from "@/db";
// import * as schema from "@/db/schema";
// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { GENDER_OPTIONS, SYNC_STATUS_OPTIONS } from "./constants/user";
// import { sendMail } from "./mailer";
// import VerifyEmail from "@/emails/verify-email";
// import Welcome from "@/emails/welcome";
// import ResetPassword from "@/emails/reset-password";
// import { createAuthMiddleware } from "better-auth/api";
// import { extractIp, getLocationFromIp, parseDevice } from "@/utils/request-info";
// import SigninAlert from "@/emails/signin-alert";
// import { formatDateTime } from "@/utils/datetime";
// import PasswordChanged from "@/emails/password-changed";

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
//     modelName: "users",
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

//     // session: {
//     //   expiresIn: 60 * 15,
//     //   disableSessionRefresh: true,
//     //   freshAge: 60 * 5,
//     // },

//     session: {
//       expiresIn: 60 * 60 * 24 * 30,
//       disableSessionRefresh: true,
//       freshAge: 60 * 60 * 24,
//     },

//     hooks: {
//       after: createAuthMiddleware(async (ctx) => {
//         // Prevent emails from sending if the API request failed
//         if (ctx.response && ctx.response.status >= 400) return;

//         const path = ctx.path;

//         // 1. Handle New Sign-Ins
//         if (path === "/sign-in/email" || path === "/sign-in/username") {
//           const user = ctx.context.newSession?.user;
//           if (!user) return;

//           const ip = extractIp(ctx.headers);
//           const { label: location } = await getLocationFromIp(ip);
//           const { browser, os } = parseDevice(ctx.headers?.get("user-agent"));

//           void sendMail({
//             to: user.email,
//             subject: "New sign-in to your account",
//             react: SigninAlert({
//               name: user.name,
//               timestamp: formatDateTime(new Date(), user.timezone), // Assuming timezone from user
//               device: `${browser} on ${os}`,
//               location,
//               ipAddress: ip,
//             }),
//           });
//           return;
//         }

//         // 2. Handle Password Changes
//         if (path === "/change-password" || path === "/reset-password") {
//           // "/change-password" requires an active session.
//           // "/reset-password" populates the user in context upon a successful reset.
//           const user = ctx.context.session?.user || ctx.context.user;

//           if (!user) return;

//           const ip = extractIp(ctx.headers);
//           const { label: location } = await getLocationFromIp(ip);
//           const { browser, os } = parseDevice(ctx.headers?.get("user-agent"));

//           void sendMail({
//             to: user.email,
//             subject: "Your password was successfully changed",
//             react: PasswordChanged({
//               name: user.name,
//               timestamp: formatDateTime(new Date(), user.timezone),
//               device: `${browser} on ${os}`,
//               location,
//             }),
//           });
//           return;
//         }
//       }),
//     },

//   },
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
    modelName: "users",
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

    // session: {
    //   expiresIn: 60 * 15,
    //   disableSessionRefresh: true,
    //   freshAge: 60 * 5,
    // },

    session: {
      expiresIn: 60 * 60 * 24 * 30,
      disableSessionRefresh: true,
      freshAge: 60 * 60 * 24,
    },

    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        // Prevent emails from sending if the API request failed.
        // `ctx.context.returned` holds either the successful payload/Response,
        // or an APIError instance if the request failed.
        const returned = ctx.context.returned;

        if (returned instanceof APIError) return;
        if (returned instanceof Response && returned.status >= 400) return;

        const path = ctx.path;

        // 1. Handle New Sign-Ins
        if (path === "/sign-in/email" || path === "/sign-in/username") {
          const user = ctx.context.newSession?.user;
          if (!user) return;

          const ip = extractIp(ctx.headers);
          const { label: location } = await getLocationFromIp(ip);
          const { browser, os } = parseDevice(ctx.headers?.get("user-agent"));

          void sendMail({
            to: user.email,
            subject: "New sign-in to your account",
            react: SigninAlert({
              name: user.name,
              timestamp: formatDateTime(new Date(), user.timezone), // Assuming timezone from user
              device: `${browser} on ${os}`,
              location,
              ipAddress: ip,
            }),
          });
          return;
        }

        // 2. Handle Password Changes
        if (path === "/change-password" || path === "/reset-password") {
          // "/change-password" requires an active session.
          // "/reset-password" populates the user in context upon a successful reset.
          const user = ctx.context.session?.user || ctx.context.user;

          if (!user) return;

          const ip = extractIp(ctx.headers);
          const { label: location } = await getLocationFromIp(ip);
          const { browser, os } = parseDevice(ctx.headers?.get("user-agent"));

          void sendMail({
            to: user.email,
            subject: "Your password was successfully changed",
            react: PasswordChanged({
              name: user.name,
              timestamp: formatDateTime(new Date(), user.timezone),
              device: `${browser} on ${os}`,
              location,
            }),
          });
          return;
        }
      }),
    },
  },
});

export type Auth = typeof auth;
