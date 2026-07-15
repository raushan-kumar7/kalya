"use client";

import { authClient } from "@/lib/auth-client";
import { runAction } from "@/lib/run-action";
import { authService } from "@/lib/services";
import { useAuthStore } from "@/stores";
import { AuthSection } from "@/types/auth";
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  SigninInput,
  SignupInput,
} from "@/validations/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

const useAuthFlow = (section: AuthSection) => {
  const isLoading = useAuthStore((s) => Boolean(s.updating[section]));
  const error = useAuthStore((s) => s.errors[section] ?? null);
  const setUpdating = useAuthStore((s) => s.setUpdating);
  const setError = useAuthStore((s) => s.setError);
  return { isLoading, error, setUpdating, setError };
};

export const useAuth = () => {
  const router = useRouter();

  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const user = session?.user ?? null;
  const isAuthenticated = Boolean(user);

  const signin = useAuthFlow("signin");
  const signup = useAuthFlow("signup");
  const signout = useAuthFlow("signout");
  const forgotPassword = useAuthFlow("forgot-password");
  const resetPassword = useAuthFlow("reset-password");
  const changePassword = useAuthFlow("change-password");
  const verifyEmail = useAuthFlow("verify-email");

  const signIn = useCallback(
    (payload: SigninInput, redirectTo = "/dashboard") =>
      runAction<unknown, AuthSection>({
        action: () => authService.signIn(payload),
        section: "signin",
        successTitle: "Welcome back",
        errorTitle: "Sign in failed",
        fallbackErrorMessage: "Could not sign in. Check your credentials and try again.",
        setUpdating: signin.setUpdating,
        setError: signin.setError,
        onSuccess: () => router.push(redirectTo),
      }),
    [router, signin.setUpdating, signin.setError]
  );

  const signUp = useCallback(
    (payload: SignupInput, redirectTo = "/onboarding") =>
      runAction<unknown, AuthSection>({
        action: () => authService.signUp(payload),
        section: "signup",
        successTitle: "Account created",
        errorTitle: "Sign up failed",
        successDescription: "Check your inbox to verify your email.",
        fallbackErrorMessage: "Could not create your account. Please try again.",
        setUpdating: signup.setUpdating,
        setError: signup.setError,
        onSuccess: () => router.push(redirectTo),
      }),
    [router, signup.setUpdating, signup.setError]
  );

  const signOut = useCallback(
    (redirectTo = "/auth/sign-in") =>
      runAction<unknown, AuthSection>({
        action: () => authService.signOut(),
        section: "signout",
        successTitle: "Signed out",
        errorTitle: "Sign out failed",
        fallbackErrorMessage: "Could not sign out. Please try again.",
        setUpdating: signout.setUpdating,
        setError: signout.setError,
        onSuccess: () => router.push(redirectTo),
      }),
    [router, signout.setUpdating, signout.setError]
  );

  const requestPasswordReset = useCallback(
    (payload: ForgotPasswordInput, redirectTo?: string) =>
      runAction<unknown, AuthSection>({
        action: () => authService.forgotPassword(payload, redirectTo),
        section: "forgot-password",
        successTitle: "Check your email",
        errorTitle: "Reset request failed",
        successDescription: "We've sent you a link to reset your password.",
        fallbackErrorMessage: "Could not send reset email. Please try again.",
        setUpdating: forgotPassword.setUpdating,
        setError: forgotPassword.setError,
      }),
    [forgotPassword.setUpdating, forgotPassword.setError]
  );

  const confirmPasswordReset = useCallback(
    (payload: ResetPasswordInput, token: string, redirectTo = "/auth/sign-in") =>
      runAction<unknown, AuthSection>({
        action: () => authService.resetPassword(payload, token),
        section: "reset-password",
        successTitle: "Password reset",
        errorTitle: "Password reset failed",
        successDescription: "You can now sign in with your new password.",
        fallbackErrorMessage: "Could not reset your password. The link may have expired.",
        setUpdating: resetPassword.setUpdating,
        setError: resetPassword.setError,
        onSuccess: () => router.push(redirectTo),
      }),
    [router, resetPassword.setUpdating, resetPassword.setError]
  );

  /**
   * Unlike `confirmPasswordReset`, this requires an active session — it's
   * the "I know my current password and want to set a new one" flow from
   * account settings, not the emailed-token flow for a signed-out user.
   */
  const changeMyPassword = useCallback(
    (payload: ChangePasswordInput, redirectTo = "/auth/sign-in") =>
      runAction<unknown, AuthSection>({
        action: () => authService.changePassword(payload),
        section: "change-password",
        successTitle: "Password changed",
        errorTitle: "Password change failed",
        successDescription: "Use your new password next time you sign in.",
        fallbackErrorMessage: "Could not change your password. Please try again.",
        setUpdating: changePassword.setUpdating,
        setError: changePassword.setError,
        onSuccess: async () => {
          await authService.signOut();
          router.push(redirectTo);
        },
      }),
    [router, changePassword.setUpdating, changePassword.setError]
  );

  const resendVerificationEmail = useCallback(
    (email: string, callbackURL?: string) =>
      runAction<unknown, AuthSection>({
        action: () => authService.resendVerificationEmail(email, callbackURL),
        section: "verify-email",
        successTitle: "Verification email sent",
        errorTitle: "Verification email failed",
        successDescription: "Check your inbox for the link.",
        fallbackErrorMessage: "Could not resend the verification email. Please try again.",
        setUpdating: verifyEmail.setUpdating,
        setError: verifyEmail.setError,
      }),
    [verifyEmail.setUpdating, verifyEmail.setError]
  );

  return {
    // session
    user,
    isAuthenticated,
    isSessionPending,

    // signin
    signIn,
    isSigningIn: signin.isLoading,
    signInError: signin.error,

    // signup
    signUp,
    isSigningUp: signup.isLoading,
    signUpError: signup.error,

    // signout
    signOut,
    isSigningOut: signout.isLoading,
    signOutError: signout.error,

    // forgot password
    requestPasswordReset,
    isRequestingPasswordReset: forgotPassword.isLoading,
    requestPasswordResetError: forgotPassword.error,

    // reset password
    confirmPasswordReset,
    isResettingPassword: resetPassword.isLoading,
    resetPasswordError: resetPassword.error,

    // change password
    changePassword: changeMyPassword,
    isChangingPassword: changePassword.isLoading,
    changePasswordError: changePassword.error,

    // verify email
    resendVerificationEmail,
    isResendingVerification: verifyEmail.isLoading,
    resendVerificationError: verifyEmail.error,
  };
};

/**
 * Keeps the zustand session mirror in sync with better-auth's reactive
 * session. Mount once near the app root (client providers), not per-page,
 * so `getAuthState()` calls outside React always reflect the latest session.
 */
export function SessionSync() {
  const { data: session, isPending } = authClient.useSession();
  const setSession = useAuthStore((s) => s.setSession);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    setInitializing(isPending);
    if (!isPending) setSession(session?.user ?? null);
  }, [session, isPending, setSession, setInitializing]);

  return null;
}
