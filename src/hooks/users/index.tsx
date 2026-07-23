// "use client";

// import { authClient } from "@/lib/auth-client";
// import { runAuthAction } from "@/lib/run-action";
// import { userService } from "@/lib/services/users";
// import { useUserStore } from "@/stores/users";
// import { UserSection } from "@/types/auth";
// import { EmailInput, PreferencesInput, UserInput, UsernameInput } from "@/validations/users";
// import { useMutation } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import { useCallback } from "react";

// const useUserFlow = (section: UserSection) => {
//   const isLoading = useUserStore((s) => Boolean(s.updating[section]));
//   const error = useUserStore((s) => s.errors[section] ?? null);
//   const setUpdating = useUserStore((s) => s.setUpdating);
//   const setError = useUserStore((s) => s.setError);
//   return { isLoading, error, setUpdating, setError };
// };

// /**
//  * We deliberately do NOT manually patch useAuthStore's session mirror after
//  * updateProfile/updateUsername/changeEmail/avatar mutations here.
//  * authClient.updateUser() triggers better-auth's own reactive session
//  * refetch under the hood, and SessionSync (mounted once near the app root)
//  * already listens to that and calls setSession for us. Duplicating that
//  * here would mean guessing at a response shape authClient.updateUser
//  * doesn't actually return (it resolves to a bare success status, not the
//  * full user record) — verify against your installed better-auth version
//  * if session updates ever look like they lag on screen.
//  */
// export const useUser = () => {
//   const router = useRouter();

//   const profile = useUserFlow("profile");
//   const security = useUserFlow("account-security");
//   const preferences = useUserFlow("preferences");

//   const updateProfile = useCallback(
//     (payload: UserInput) =>
//       runAuthAction({
//         action: () => userService.updateProfile(payload),
//         section: "profile",
//         successTitle: "Profile updated",
//         fallbackErrorMessage: "Could not update your profile. Please try again.",
//         setUpdating: profile.setUpdating,
//         setError: profile.setError,
//       }),
//     [profile.setUpdating, profile.setError]
//   );

//   const updateUsername = useCallback(
//     (payload: UsernameInput) =>
//       runAuthAction({
//         action: () => userService.updateUsername(payload),
//         section: "profile",
//         successTitle: "Username updated",
//         fallbackErrorMessage: "Could not update your username. Please try again.",
//         setUpdating: profile.setUpdating,
//         setError: profile.setError,
//       }),
//     [profile.setUpdating, profile.setError]
//   );

//   const changeEmail = useCallback(
//     (payload: EmailInput, callbackURL?: string) =>
//       runAuthAction({
//         action: () => userService.changeEmail(payload, callbackURL),
//         section: "profile",
//         successTitle: "Check your inbox",
//         successDescription: "Confirm the change from your new email address.",
//         fallbackErrorMessage: "Could not update your email. Please try again.",
//         setUpdating: profile.setUpdating,
//         setError: profile.setError,
//       }),
//     [profile.setUpdating, profile.setError]
//   );

//   // --- Avatar: upload/delete are fire-once actions with their own
//   // pending/error state, which is exactly what useMutation is for — no
//   // need to route these through the zustand updating/errors map too.

//   const avatarMutation = useMutation({
//     mutationFn: async (file: File) => {
//       const { url, publicId } = await userService.uploadAvatarFile(file);
//       const { error } = await authClient.updateUser({ image: url });
//       if (error) throw new Error(error.message ?? "Could not update avatar.");
//       return { url, publicId };
//     },
//   });

//   const removeAvatarMutation = useMutation({
//     mutationFn: async () => {
//       const { error } = await userService.removeAvatar();
//       if (error) throw new Error(error.message ?? "Could not remove avatar.");
//     },
//   });

//   const updatePreferences = useCallback(
//     (payload: PreferencesInput) =>
//       runAuthAction({
//         action: () => userService.updatePreferences(payload),
//         section: "preferences",
//         successTitle: "Preferences saved",
//         fallbackErrorMessage: "Could not save your preferences. Please try again.",
//         setUpdating: preferences.setUpdating,
//         setError: preferences.setError,
//       }),
//     [preferences.setUpdating, preferences.setError]
//   );

//   // const deleteAccount = useCallback(
//   //   (password?: string) =>
//   //     runAuthAction({
//   //       action: () => userService.deleteAccount(password),
//   //       section: "account-security",
//   //       successTitle: "Account deleted",
//   //       fallbackErrorMessage: "Could not delete your account. Please try again.",
//   //       setUpdating: security.setUpdating,
//   //       setError: security.setError,
//   //     }),
//   //   [security.setUpdating, security.setError]
//   // );

//   const deleteAccount = useCallback(
//     (password?: string, redirectTo = "/auth/sign-in") =>
//       runAuthAction({
//         action: () => userService.deleteAccount(password),
//         section: "account-security",
//         successTitle: "Account deleted",
//         fallbackErrorMessage: "Could not delete your account. Please try again.",
//         setUpdating: security.setUpdating,
//         setError: security.setError,
//         onSuccess: () => router.push(redirectTo),
//       }),
//     [router, security.setUpdating, security.setError]
//   );

//   return {
//     updateProfile,
//     updateUsername,
//     changeEmail,
//     isUpdatingProfile: profile.isLoading,
//     updateProfileError: profile.error,

//     updateAvatar: avatarMutation.mutateAsync,
//     isUpdatingAvatar: avatarMutation.isPending,
//     updateAvatarError: avatarMutation.error?.message ?? null,

//     removeAvatar: removeAvatarMutation.mutateAsync,
//     isRemovingAvatar: removeAvatarMutation.isPending,
//     removeAvatarError: removeAvatarMutation.error?.message ?? null,

//     updatePreferences,
//     isSavingPreferences: preferences.isLoading,
//     savePreferencesError: preferences.error,

//     deleteAccount,
//     isUpdatingSecurity: security.isLoading,
//     securityError: security.error,
//   };
// };

"use client";

import { authClient } from "@/lib/auth-client";
import { runAuthAction } from "@/lib/run-action";
import { userService } from "@/lib/services/users";
import { useUserStore } from "@/stores/users";
import { UserSection } from "@/types/auth";
import { EmailInput, PreferencesInput, UserInput, UsernameInput } from "@/validations/users";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const useUserFlow = (section: UserSection) => {
  const isLoading = useUserStore((s) => Boolean(s.updating[section]));
  const error = useUserStore((s) => s.errors[section] ?? null);
  const setUpdating = useUserStore((s) => s.setUpdating);
  const setError = useUserStore((s) => s.setError);
  return { isLoading, error, setUpdating, setError };
};

/**
 * We deliberately do NOT manually patch useAuthStore's session mirror after
 * updateProfile/updateUsername/changeEmail/avatar mutations here.
 * authClient.updateUser() triggers better-auth's own reactive session
 * refetch under the hood, and SessionSync (mounted once near the app root)
 * already listens to that and calls setSession for us. Duplicating that
 * here would mean guessing at a response shape authClient.updateUser
 * doesn't actually return (it resolves to a bare success status, not the
 * full user record) — verify against your installed better-auth version
 * if session updates ever look like they lag on screen.
 */
export const useUser = () => {
  const router = useRouter();

  const profile = useUserFlow("profile");
  const security = useUserFlow("account-security");
  const preferences = useUserFlow("preferences");

  const updateProfile = useCallback(
    (payload: UserInput) =>
      runAuthAction({
        action: () => userService.updateProfile(payload),
        section: "profile",
        successTitle: "Profile updated",
        successDescription: "Your changes have been saved.",
        errorTitle: "Profile update failed",
        fallbackErrorMessage: "Could not update your profile. Please try again.",
        setUpdating: profile.setUpdating,
        setError: profile.setError,
      }),
    [profile.setUpdating, profile.setError]
  );

  const updateUsername = useCallback(
    (payload: UsernameInput) =>
      runAuthAction({
        action: () => userService.updateUsername(payload),
        section: "profile",
        successTitle: "Username updated",
        successDescription: "You'll use this new username to sign in from now on.",
        errorTitle: "Username update failed",
        fallbackErrorMessage: "Could not update your username. Please try again.",
        setUpdating: profile.setUpdating,
        setError: profile.setError,
      }),
    [profile.setUpdating, profile.setError]
  );

  const changeEmail = useCallback(
    (payload: EmailInput, callbackURL?: string) =>
      runAuthAction({
        action: () => userService.changeEmail(payload, callbackURL),
        section: "profile",
        successTitle: "Check your inbox",
        successDescription: "Confirm the change from your new email address.",
        errorTitle: "Email change failed",
        fallbackErrorMessage: "Could not update your email. Please try again.",
        setUpdating: profile.setUpdating,
        setError: profile.setError,
      }),
    [profile.setUpdating, profile.setError]
  );

  // --- Avatar: upload/delete are fire-once actions with their own
  // pending/error state, which is exactly what useMutation is for — no
  // need to route these through the zustand updating/errors map too.

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const { url, publicId } = await userService.uploadAvatarFile(file);
      const { error } = await authClient.updateUser({ image: url });
      if (error) throw new Error(error.message ?? "Could not update avatar.");
      return { url, publicId };
    },
  });

  const removeAvatarMutation = useMutation({
    mutationFn: async () => {
      const { error } = await userService.removeAvatar();
      if (error) throw new Error(error.message ?? "Could not remove avatar.");
    },
  });

  const updatePreferences = useCallback(
    (payload: PreferencesInput) =>
      runAuthAction({
        action: () => userService.updatePreferences(payload),
        section: "preferences",
        successTitle: "Preferences saved",
        successDescription: "Your preferences have been applied.",
        errorTitle: "Preferences update failed",
        fallbackErrorMessage: "Could not save your preferences. Please try again.",
        setUpdating: preferences.setUpdating,
        setError: preferences.setError,
      }),
    [preferences.setUpdating, preferences.setError]
  );

  const deleteAccount = useCallback(
    (password?: string, redirectTo = "/auth/sign-in") =>
      runAuthAction({
        action: () => userService.deleteAccount(password),
        section: "account-security",
        successTitle: "Account deleted",
        successDescription: "Your account and all associated data have been permanently removed.",
        errorTitle: "Account deletion failed",
        fallbackErrorMessage: "Could not delete your account. Please try again.",
        setUpdating: security.setUpdating,
        setError: security.setError,
        onSuccess: () => router.push(redirectTo),
      }),
    [router, security.setUpdating, security.setError]
  );

  return {
    updateProfile,
    updateUsername,
    changeEmail,
    isUpdatingProfile: profile.isLoading,
    updateProfileError: profile.error,

    updateAvatar: avatarMutation.mutateAsync,
    isUpdatingAvatar: avatarMutation.isPending,
    updateAvatarError: avatarMutation.error?.message ?? null,

    removeAvatar: removeAvatarMutation.mutateAsync,
    isRemovingAvatar: removeAvatarMutation.isPending,
    removeAvatarError: removeAvatarMutation.error?.message ?? null,

    updatePreferences,
    isSavingPreferences: preferences.isLoading,
    savePreferencesError: preferences.error,

    deleteAccount,
    isUpdatingSecurity: security.isLoading,
    securityError: security.error,
  };
};
