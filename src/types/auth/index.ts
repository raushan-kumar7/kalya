// import type { authClient } from "@/lib/auth-client";

// export type Session = typeof authClient.$Infer.Session;
// export type User = Session["user"];

// /** Account-settings sections (profile page, already covered). */
// export const USER_SECTIONS = [
//   "profile",
//   "email",
//   "password",
//   "avatar",
//   "preferences",
//   "sessions",
//   "account",
// ] as const;
// export type UserSection = (typeof USER_SECTIONS)[number];

// /** Auth-flow sections (signin/signup pages) — kept separate so a signup
//  *  form's loading state never interferes with a signin form's, and vice versa. */
// export const AUTH_SECTIONS = [
//   "signin",
//   "signup",
//   "signout",
//   "forgot-password",
//   "reset-password",
//   "change-password",
//   "verify-email",
// ] as const;
// export type AuthSection = (typeof AUTH_SECTIONS)[number];

// // this for username
// export type Status = "idle" | "invalid" | "checking" | "available" | "taken" | "error";

// export type Result = {
//   value: string;
//   status: "available" | "taken" | "error";
// };

import type { authClient } from "@/lib/auth-client";

export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];

/** Account-settings sections shown in the settings nav. */
export const USER_SECTIONS = [
  "profile",
  "account-security",
  "categories-budgets",
  "notification",
  "preferences",
] as const;
export type UserSection = (typeof USER_SECTIONS)[number];

/** Auth-flow sections (signin/signup pages) — kept separate so a signup
 *  form's loading state never interferes with a signin form's, and vice versa. */
export const AUTH_SECTIONS = [
  "signin",
  "signup",
  "signout",
  "forgot-password",
  "reset-password",
  "change-password",
  "verify-email",
] as const;
export type AuthSection = (typeof AUTH_SECTIONS)[number];

// this for username
export type Status = "idle" | "invalid" | "checking" | "available" | "taken" | "error";

export type Result = {
  value: string;
  status: "available" | "taken" | "error";
};

/** Raw session record shape exactly as better-auth returns it — inferred
 *  instead of hand-typed so it can't drift from the real client type. */
type RawSession = Session["session"];

/** A session enriched with device/location, which better-auth doesn't
 *  compute for you — resolved server-side in /api/user/sessions from the
 *  raw ip/userAgent using the same utils auth.ts uses for emails. */
export interface AuthSession
  extends Pick<RawSession, "id" | "ipAddress" | "userAgent" | "createdAt" | "updatedAt"> {
  device: string;
  os: string;
  browser: string;
  location: string;
  current: boolean;
}