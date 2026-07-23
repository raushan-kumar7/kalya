import { apiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { AuthSession } from "@/types/auth";
import { displayName } from "@/utils/display-name";
import { EmailInput, PreferencesInput, UserInput, UsernameInput } from "@/validations/users";

export const userService = {
  updateProfile: async (payload: UserInput) => {
    const fullName = await displayName(
      payload.first_name,
      payload.last_name,
      payload.middle_name ?? ""
    );
    return await authClient.updateUser({
      name: fullName,
      first_name: payload.first_name,
      middle_name: payload.middle_name ?? undefined,
      last_name: payload.last_name,
      gender: payload.gender ?? undefined,
      date_of_birth: payload.date_of_birth ?? undefined,
      phone: payload.phone ?? undefined,
    });
  },

  updateUsername: async ({ username }: UsernameInput) => {
    return await authClient.updateUser({ username });
  },

  /**
   * better-auth sends a confirmation link to the *new* address before the
   * change takes effect — nothing changes in the DB until that link is
   * clicked, so there's no local state to update on success here.
   */
  changeEmail: async ({ email }: EmailInput, callbackURL?: string) => {
    return await authClient.changeEmail({ newEmail: email, callbackURL });
  },

  /**
   * These two throw (via apiClient) rather than return { data, error } —
   * that's the shape React Query mutations want, since it catches the
   * throw and populates isError/error itself.
   */
  uploadAvatarFile: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.postForm<{ url: string; publicId: string }>("/api/users/avatar", form);
  },

  deleteAvatarFile: (publicId: string) =>
    apiClient.delete<{ success: true }>("/api/users/avatar", { publicId }),

  removeAvatar: async () => authClient.updateUser({ image: null }),

  updatePreferences: async (payload: PreferencesInput) => {
    return await authClient.updateUser({
      locale: payload.locale ?? undefined,
      timezone: payload.timezone ?? undefined,
      currency: payload.currency ?? undefined,
    });
  },

  /**
   * IP -> location resolution needs to happen server-side (same
   * getLocationFromIp/parseDevice utils auth.ts already uses for emails),
   * so this hits a route handler instead of calling better-auth directly.
   */
  listSessions: () => apiClient.get<{ sessions: AuthSession[] }>("/api/users/sessions"),

  revokeSession: async (token: string) => authClient.revokeSession({ token }),

  revokeOtherSessions: async () => authClient.revokeOtherSessions(),

  deleteAccount: async (password?: string) =>
    authClient.deleteUser(password ? { password } : undefined),
};
