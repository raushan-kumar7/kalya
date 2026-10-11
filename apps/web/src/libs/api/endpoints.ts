/**
 * Centralized API endpoints dictionary matching @kalya/api-server Fastify routes.
 *
 * All paths are relative to the server origin (e.g. http://localhost:3600).
 * Health probes are mounted at the server root; every other module lives under `/api/v1`.
 */

const ROOT = '/api/v1';

const AUTH = `${ROOT}/auth`;
const USERS = `${ROOT}/users`;
const FINANCES = `${ROOT}/finances`;
const NOTIFICATIONS = `${ROOT}/notifications`;

export const ENDPOINTS = {
  // Authentication & Better-Auth endpoints (/api/v1/auth/*)
  AUTH: {
    ROOT: AUTH,
    SIGN_IN_EMAIL: `${AUTH}/sign-in/email`,
    SIGN_IN_USERNAME: `${AUTH}/sign-in/username`,
    SIGN_UP_EMAIL: `${AUTH}/sign-up/email`,
    SIGN_OUT: `${AUTH}/sign-out`,
    SESSION: `${AUTH}/get-session`,
    FORGOT_PASSWORD: `${AUTH}/request-password-reset`,
    RESET_PASSWORD: `${AUTH}/reset-password`,
    VERIFY_EMAIL: `${AUTH}/verify-email`,
    SEND_VERIFICATION_EMAIL: `${AUTH}/send-verification-email`,
    CHANGE_PASSWORD: `${AUTH}/change-password`,
    CHECK_AVAILABILITY: `${AUTH}/check-availability`,
    SIGN_IN_SOCIAL: `${AUTH}/sign-in/social`,
    CALLBACK_GOOGLE: `${AUTH}/callback/google`,
  },

  // User Profile & Account Management (/api/v1/users/*)
  USERS: {
    ROOT: USERS,
    LIST: USERS,
    SEARCH: `${USERS}/search`,
    ME: `${USERS}/me`,
    UPDATE_PROFILE: USERS,
    UPDATE_USERNAME: `${USERS}/username`,
    SUGGEST_USERNAME: `${USERS}/suggest-username`,
    AVATAR: `${USERS}/avatar`,
    SESSIONS: `${USERS}/sessions`,
    REVOKE_SESSION: (sessionId: string) => `${USERS}/sessions/${sessionId}`,
    REVOKE_OTHER_SESSIONS: `${USERS}/sessions/revoke-others`,
    SCHEDULE_DELETION: `${USERS}/schedule-deletion`,
    CANCEL_DELETION: `${USERS}/cancel-deletion`,
    REQUEST_EMAIL_CHANGE: `${USERS}/request-email-change`,
    ADMIN_BROADCAST_POLICY: `${USERS}/admin/broadcast-policy`,
  },

  // // Finances & Ledger Subsystems (/api/v1/finances/*)
  // FINANCES: {
  //   ROOT: FINANCES,

  //   // Allocation Buckets
  //   BUCKETS: {
  //     LIST: `${FINANCES}/buckets`,
  //     SEED_DEFAULTS: `${FINANCES}/buckets/seed-defaults`,
  //     DETAIL: (id: string) => `${FINANCES}/buckets/${id}`,
  //     CREATE: `${FINANCES}/buckets`,
  //     UPDATE: (id: string) => `${FINANCES}/buckets/${id}`,
  //     DELETE: (id: string) => `${FINANCES}/buckets/${id}`,
  //   },

  //   // Expense Categories
  //   CATEGORIES: {
  //     LIST: `${FINANCES}/categories`,
  //     SEED_DEFAULTS: `${FINANCES}/categories/seed-defaults`,
  //     DETAIL: (id: string) => `${FINANCES}/categories/${id}`,
  //     CREATE: `${FINANCES}/categories`,
  //     UPDATE: (id: string) => `${FINANCES}/categories/${id}`,
  //     DELETE: (id: string) => `${FINANCES}/categories/${id}`,
  //   },

  //   // Monthly Income
  //   INCOME: {
  //     LIST: `${FINANCES}/income`,
  //     DETAIL: (id: string) => `${FINANCES}/income/${id}`,
  //     CREATE: `${FINANCES}/income`,
  //     UPDATE: (id: string) => `${FINANCES}/income/${id}`,
  //     DELETE: (id: string) => `${FINANCES}/income/${id}`,
  //   },

  //   // Budget Plans
  //   BUDGETS: {
  //     LIST: `${FINANCES}/budgets`,
  //     DETAIL: (id: string) => `${FINANCES}/budgets/${id}`,
  //     HEALTH: (id: string) => `${FINANCES}/budgets/${id}/health`,
  //     CREATE: `${FINANCES}/budgets`,
  //     UPDATE: (id: string) => `${FINANCES}/budgets/${id}`,
  //     DELETE: (id: string) => `${FINANCES}/budgets/${id}`,
  //   },

  //   // Expenses
  //   EXPENSES: {
  //     LIST: `${FINANCES}/expenses`,
  //     DETAIL: (id: string) => `${FINANCES}/expenses/${id}`,
  //     CREATE: `${FINANCES}/expenses`,
  //     UPDATE: (id: string) => `${FINANCES}/expenses/${id}`,
  //     DELETE: (id: string) => `${FINANCES}/expenses/${id}`,
  //   },

  //   // Split Contacts & Obligations
  //   SPLITS: {
  //     CONTACTS: `${FINANCES}/splits/contacts`,
  //     CONTACT_DETAIL: (id: string) => `${FINANCES}/splits/contacts/${id}`,
  //     SHARES_PENDING: `${FINANCES}/splits/shares/pending`,
  //     SETTLE_SHARE: (id: string) => `${FINANCES}/splits/shares/${id}/settle`,
  //   },

  //   // Financial Goals
  //   GOALS: {
  //     LIST: `${FINANCES}/goals`,
  //     DETAIL: (id: string) => `${FINANCES}/goals/${id}`,
  //     CREATE: `${FINANCES}/goals`,
  //     UPDATE: (id: string) => `${FINANCES}/goals/${id}`,
  //     DELETE: (id: string) => `${FINANCES}/goals/${id}`,
  //   },

  //   // Multi-Class Assets
  //   ASSETS: {
  //     DIGITAL: `${FINANCES}/assets/digital`,
  //     EQUITY: `${FINANCES}/assets/equity`,
  //     SUMMARY: `${FINANCES}/assets/summary`,
  //   },

  //   // Dashboard Summaries
  //   SUMMARIES: {
  //     OVERVIEW: `${FINANCES}/summaries/overview`,
  //     GENERATE_STATEMENT: `${FINANCES}/summaries/statements/generate`,
  //   },
  // },

  // Finances & Ledger Subsystems (/api/v1/finances/*)
  FINANCES: {
    ROOT: FINANCES,

    // Allocation Buckets
    BUCKETS: {
      LIST: `${FINANCES}/buckets`,
      SEED_DEFAULTS: `${FINANCES}/buckets/seed-defaults`,
      DETAIL: (id: string) => `${FINANCES}/buckets/${id}`,
      CREATE: `${FINANCES}/buckets`,
      UPDATE: (id: string) => `${FINANCES}/buckets/${id}`,
      DELETE: (id: string) => `${FINANCES}/buckets/${id}`,
    },

    // Expense Categories
    CATEGORIES: {
      LIST: `${FINANCES}/categories`,
      SEED_DEFAULTS: `${FINANCES}/categories/seed-defaults`,
      DETAIL: (id: string) => `${FINANCES}/categories/${id}`,
      CREATE: `${FINANCES}/categories`,
      UPDATE: (id: string) => `${FINANCES}/categories/${id}`,
      DELETE: (id: string) => `${FINANCES}/categories/${id}`,
    },

    // Monthly Income
    INCOME: {
      LIST: `${FINANCES}/income`,
      DETAIL: (id: string) => `${FINANCES}/income/${id}`,
      CREATE: `${FINANCES}/income`,
      UPDATE: (id: string) => `${FINANCES}/income/${id}`,
      DELETE: (id: string) => `${FINANCES}/income/${id}`,
    },

    // Budget Plans
    BUDGETS: {
      LIST: `${FINANCES}/budgets`,
      DETAIL: (id: string) => `${FINANCES}/budgets/${id}`,
      HEALTH: (id: string) => `${FINANCES}/budgets/${id}/health`,
      CREATE: `${FINANCES}/budgets`,
      UPDATE: (id: string) => `${FINANCES}/budgets/${id}`,
      DELETE: (id: string) => `${FINANCES}/budgets/${id}`,
    },

    // Expenses
    EXPENSES: {
      LIST: `${FINANCES}/expenses`,
      DETAIL: (id: string) => `${FINANCES}/expenses/${id}`,
      CREATE: `${FINANCES}/expenses`,
      UPDATE: (id: string) => `${FINANCES}/expenses/${id}`,
      DELETE: (id: string) => `${FINANCES}/expenses/${id}`,
    },

    // Split Contacts & Obligations (Aligned with api-server)
    SPLITS: {
      CONTACTS: `${FINANCES}/splits/contacts`,
      CONTACT_DETAIL: (id: string) => `${FINANCES}/splits/contacts/${id}`,
      CONTACT_LINK: (id: string) => `${FINANCES}/splits/contacts/${id}/link`,
      CONTACT_UNLINK: (id: string) => `${FINANCES}/splits/contacts/${id}/unlink`,
      CONTACT_SUGGESTIONS: `${FINANCES}/splits/contacts/suggestions`,
      INVITATIONS: `${FINANCES}/splits/invitations`,
      INVITATION_RESPOND: (id: string) => `${FINANCES}/splits/invitations/${id}/respond`,
      SHARES_PENDING: `${FINANCES}/splits/pending`, // FIXED: was /splits/shares/pending
      SETTLE_SHARE: (id: string) => `${FINANCES}/splits/shares/${id}/settle`,
    },

    // Financial Goals
    GOALS: {
      LIST: `${FINANCES}/goals`,
      DETAIL: (id: string) => `${FINANCES}/goals/${id}`,
      CREATE: `${FINANCES}/goals`,
      UPDATE: (id: string) => `${FINANCES}/goals/${id}`,
      DELETE: (id: string) => `${FINANCES}/goals/${id}`,
    },

    // Multi-Class Assets (Aligned with api-server)
    ASSETS: {
      DIGITAL: `${FINANCES}/assets/digital`,
      EQUITIES: `${FINANCES}/assets/equities`, // FIXED: was /assets/equity
      SUMMARY: `${FINANCES}/assets/portfolio-summary`, // FIXED: was /assets/summary
    },

    // Dashboard Summaries
    SUMMARIES: {
      OVERVIEW: `${FINANCES}/summaries/overview`,
      GENERATE_STATEMENT: `${FINANCES}/summaries/statements/generate`,
    },
  },

  // Notifications & User Alerts (/api/v1/notifications/*)
  NOTIFICATIONS: {
    ROOT: NOTIFICATIONS,
    ALERTS: {
      LIST: `${NOTIFICATIONS}/alerts`,
      UNREAD_COUNT: `${NOTIFICATIONS}/alerts/unread-count`,
      MARK_READ: (id: string) => `${NOTIFICATIONS}/alerts/${id}/read`,
      BATCH_MARK_READ: `${NOTIFICATIONS}/alerts/mark-read`,
      DELETE: (id: string) => `${NOTIFICATIONS}/alerts/${id}`,
    },
    PREFERENCES: {
      LIST: `${NOTIFICATIONS}/preferences`,
      UPSERT: `${NOTIFICATIONS}/preferences`,
      UPDATE: (id: string) => `${NOTIFICATIONS}/preferences/${id}`,
    },
  },

  // System Health & Monitoring (mounted at server root, not under /api/v1)
  HEALTH: {
    ROOT: '/health',
    LIVE: '/health/live',
    READY: '/health/ready',
  },
} as const;
