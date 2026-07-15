// import { auth } from "@/lib/auth";

// export type AuthSession = typeof auth.$Infer.Session;
// export type User = AuthSession["user"];
// export type Session = AuthSession["session"];

import type { authClient } from "@/lib/auth-client";

export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];

/** Account-settings sections (profile page, already covered). */
export const USER_SECTIONS = [
  "profile",
  "email",
  "password",
  "avatar",
  "preferences",
  "sessions",
  "account",
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
