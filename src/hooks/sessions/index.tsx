// "use client";

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { userService } from "@/lib/services/users";

// const SESSIONS_KEY = ["user", "sessions"] as const;

// export const useSessions = () => {
//   const queryClient = useQueryClient();

//   const query = useQuery({
//     queryKey: SESSIONS_KEY,
//     queryFn: () => userService.listSessions().then((r) => r.sessions),
//   });

//   const revokeMutation = useMutation({
//     mutationFn: (token: string) => userService.revokeSession(token),
//     // Refetch rather than hand-splice the array — one row disappearing
//     // isn't worth the complexity of manual cache patching here.
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
//   });

//   const revokeOthersMutation = useMutation({
//     mutationFn: () => userService.revokeOtherSessions(),
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
//   });

//   return {
//     sessions: query.data ?? [],
//     isLoading: query.isLoading,
//     isRefetching: query.isFetching && !query.isLoading,
//     error: query.error?.message ?? null,
//     refresh: () => queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),

//     revoke: revokeMutation.mutateAsync,
//     isRevoking: revokeMutation.isPending,

//     revokeOthers: revokeOthersMutation.mutateAsync,
//     isRevokingOthers: revokeOthersMutation.isPending,
//   };
// };


"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/lib/services/users";
import { useAuth } from "@/hooks/auth";
import { useAppEvent } from "@/hooks";

const SESSIONS_KEY = ["user", "sessions"] as const;

export const useSessions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: () => userService.listSessions().then((r) => r.sessions),
    // Sessions are meaningless (and the endpoint will 401) without a
    // signed-in user — don't fire the request until we have one.
    enabled: !!user,
  });

//   const query = useQuery({
//   queryKey: SESSIONS_KEY,
//   queryFn: async () => {
//     const res = await userService.listSessions(); // throws ApiError on non-2xx, per apiClient
//     return res.sessions;
//   },
//   enabled: !!user,
//   retry: false, // don't retry a 403 that needs a fresh login — retrying won't help
// });

  // If the auth session expires while this hook is mounted, drop the
  // cached session list rather than let a signed-out user's screen keep
  // showing the previous user's devices.
  useAppEvent("auth:session-expired", () => {
    queryClient.removeQueries({ queryKey: SESSIONS_KEY });
  });

  const revokeMutation = useMutation({
    mutationFn: (token: string) => userService.revokeSession(token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
  });

  const revokeOthersMutation = useMutation({
    mutationFn: () => userService.revokeOtherSessions(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
  });

  return {
    sessions: query.data ?? [],
    // While disabled (no user), isLoading is misleadingly true in some
    // react-query versions — fold in the enabled check explicitly.
    isLoading: !!user && query.isLoading,
    isRefetching: query.isFetching && !query.isLoading,
    error: query.error?.message ?? null,
    refresh: () => queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),

    revoke: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,

    revokeOthers: revokeOthersMutation.mutateAsync,
    isRevokingOthers: revokeOthersMutation.isPending,
  };
};