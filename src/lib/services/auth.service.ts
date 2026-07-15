import {
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  SigninInput,
  SignupInput,
} from "@/validations/auth";
import { authClient } from "../auth-client";
import { displayName } from "@/utils/display-name";
import { generateUsername } from "@/utils/generate-username";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authService = {
  checkUsernameAvailability: async (username: string, signal?: AbortSignal) => {
    return authClient.isUsernameAvailable({ username }, { signal });
  },

  signIn: async ({ userId, password }: SigninInput) => {
    return EMAIL_PATTERN.test(userId)
      ? await authClient.signIn.email({ email: userId, password })
      : await authClient.signIn.username({ username: userId, password });
  },

  signUp: async (payload: SignupInput) => {
    const { firstName, middleName, lastName, username, email, password } = payload;
    const name = await displayName(firstName, lastName, middleName);

    return await authClient.signUp.email({
      email,
      password,
      name,
      username: username || (await generateUsername(firstName, lastName, middleName)),
      first_name: firstName,
      middle_name: middleName || undefined,
      last_name: lastName,
    });
  },

  signOut: async () => authClient.signOut(),

  /**
   * Triggers the "reset your password" email. `redirectTo` controls where
   * better-auth sends the user after they click the link in that email
   * (defaults to whatever's configured server-side in `auth.ts` if omitted).
   */
  forgotPassword: async ({ email }: ForgotPasswordInput, redirectTo?: string) => {
    return await authClient.requestPasswordReset({ email, redirectTo });
  },

  /**
   * `token` comes from the reset-password page's URL query param
   * (better-auth appends it to the link sent in the forgot-password email),
   * not from the form itself — so it's a separate argument, not part of
   * `ResetPasswordInput`.
   */
  resetPassword: async ({ password }: ResetPasswordInput, token: string) => {
    return await authClient.resetPassword({ newPassword: password, token });
  },

  /**
   * Requires an active session — this changes the password for the
   * currently signed-in user, unlike `resetPassword` which works via a
   * one-time emailed token for a signed-out user.
   */
  changePassword: async ({ currentPassword, password }: ChangePasswordInput) => {
    return await authClient.changePassword({
      currentPassword,
      newPassword: password,
      revokeOtherSessions: true,
    });
  },

  resendVerificationEmail: async (email: string, callbackURL?: string) => {
    return await authClient.sendVerificationEmail({ email, callbackURL });
  },
};
