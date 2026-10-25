export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    availability: (field: string, val: string) =>
      [...queryKeys.auth.all, 'availability', field, val] as const,
  },

  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.users.all, 'list', params] as const,
    search: (q?: string) => [...queryKeys.users.all, 'search', q ?? ''] as const,
    sessions: () => [...queryKeys.users.all, 'sessions'] as const,
    suggestUsername: (name?: string) => [...queryKeys.users.all, 'suggest-username', name] as const,
  },
};
