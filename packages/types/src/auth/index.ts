import {
  Gender,
  Identifiable,
  ISODate,
  ISOTimestamp,
  SyncStatus,
  UUID,
  UserRole,
  UserStatus,
} from '../core';

/**
 * Standard camelCase timestamps matching Better-Auth and Drizzle schema conventions.
 */
export interface AuthTimestamps {
  /** Timestamp when entity was initially created */
  createdAt: ISOTimestamp;
  /** Timestamp when entity was last updated */
  updatedAt: ISOTimestamp;
}

/**
 * Core User entity matching Better-Auth schema and Kalya domain fields.
 */
export interface User extends Identifiable, AuthTimestamps {
  /** Full concatenated or legal name */
  name: string;
  /** Primary contact and login email address */
  email: string;
  /** Email address verification state */
  emailVerified: boolean;
  /** URL pointing to the user profile avatar */
  image?: string | null;

  // ---- Kalya Extended Profile Fields ----
  /** Unique public username handle */
  username: string;
  /** Optional custom display name or handle styling */
  displayUsername?: string | null;
  /** Legal or given first name */
  first_name: string;
  /** Optional middle name */
  middle_name?: string | null;
  /** Legal or family last name */
  last_name: string;
  /** Self-identified gender */
  gender?: Gender | null;
  /** Date of birth in YYYY-MM-DD format */
  dateOfBirth?: ISODate | null;
  /** Primary contact phone number */
  phone?: string | null;
  /** Language/region preference (e.g., 'en-US') */
  locale?: string | null;
  /** IANA timezone identifier (e.g., 'Asia/Kolkata') */
  timezone?: string | null;
  /** ISO 4217 3-letter currency code (e.g., 'INR', 'USD') */
  currency?: string | null;
  /** Offline synchronization status */
  sync_status: SyncStatus;

  // ---- Kalya Super-Admin & Governance Fields ----
  /** Assigned platform privilege role */
  role: UserRole;
  /** Current account lifecycle state */
  status: UserStatus;
  /** Timestamp when account was banned/suspended if applicable */
  bannedAt?: ISODate | null;
  /** Reason provided by administrator for account ban */
  banReason?: string | null;
  /** Timestamp when user last initiated an authenticated request */
  lastActiveAt?: ISODate | null;
}

/**
 * Active user session entity managed by Better-Auth.
 */
export interface Session extends Identifiable, AuthTimestamps {
  /** Foreign key pointing to User.id */
  userId: UUID;
  /** Cryptographic token string presented by cookie or Bearer header */
  token: string;
  /** Timestamp when the session strictly expires */
  expiresAt: ISOTimestamp;
  /** Client IP address recorded during login/activity */
  ipAddress?: string | null;
  /** Browser or native device user agent string */
  userAgent?: string | null;
  /** Impersonating administrator user ID if active */
  impersonatedBy?: string | null;
}

/**
 * Linked authentication account (Credential password or OAuth provider).
 */
export interface Account extends Identifiable, AuthTimestamps {
  /** Foreign key pointing to User.id */
  userId: UUID;
  /** Provider identifier ('credential', 'google', 'github', 'apple') */
  providerId: string;
  /** Provider-specific account identifier */
  accountId: string;
  /** OAuth issuer URL if applicable */
  issuer?: string | null;
  /** Hashed password for credential-based authentication */
  password?: string | null;
  /** OAuth access token */
  accessToken?: string | null;
  /** OAuth refresh token */
  refreshToken?: string | null;
  /** OpenID Connect ID token */
  idToken?: string | null;
  /** OAuth access token expiration timestamp */
  accessTokenExpiresAt?: ISOTimestamp | null;
  /** OAuth refresh token expiration timestamp */
  refreshTokenExpiresAt?: ISOTimestamp | null;
  /** Granted OAuth scopes */
  scope?: string | null;
}

/**
 * Temporary verification record for OTPs, email verifications, and password resets.
 */
export interface Verification extends Identifiable, AuthTimestamps {
  /** Target identifier (email address, phone number, or token subject) */
  identifier: string;
  /** Verification token, OTP hash, or signed payload */
  value: string;
  /** Expiration timestamp */
  expiresAt: ISOTimestamp;
}

/**
 * Resolved session context available on authenticated requests.
 */
export interface AuthSessionContext {
  /** Current authenticated user */
  user: User;
  /** Current active session */
  session: Session;
}

/**
 * Input payload for email registration.
 */
export interface SignUpDto {
  /** Login email address */
  email: string;
  /** Plaintext account password */
  password: string;
  /** Unique username handle */
  username: string;
  /** Legal or given first name */
  first_name: string;
  /** Legal or family last name */
  last_name: string;
  /** Optional middle name */
  middle_name?: string;
  /** Optional display handle formatting */
  displayUsername?: string;
  /** Self-identified gender */
  gender?: Gender;
  /** Date of birth in YYYY-MM-DD */
  dateOfBirth?: ISODate;
  /** Contact phone number */
  phone?: string;
  /** Locale preference */
  locale?: string;
  /** Timezone identifier */
  timezone?: string;
  /** Default currency code */
  currency?: string;
  /** Avatar image URL */
  image?: string;
}

/**
 * Input payload for user login.
 */
export interface SignInDto {
  /** Email address or unique username handle */
  identifier: string;
  /** Plaintext password */
  password: string;
  /** Whether to issue an extended long-lived session */
  rememberMe?: boolean;
}

/**
 * Input payload for initiating password reset.
 */
export interface ForgotPasswordDto {
  /** Account email address */
  email: string;
  /** Optional client redirect URL with reset token */
  redirectTo?: string;
}

/**
 * Input payload for completing password reset.
 */
export interface ResetPasswordDto {
  /** Password reset token received via email */
  token: string;
  /** New account password */
  newPassword: string;
}

/**
 * Input payload for changing password when authenticated.
 */
export interface ChangePasswordDto {
  /** Current active password */
  currentPassword: string;
  /** Desired new password */
  newPassword: string;
  /** Whether to terminate all other active sessions */
  revokeOtherSessions?: boolean;
}

/**
 * Input payload for verifying email address.
 */
export interface VerifyEmailDto {
  /** Verification token from verification email */
  token: string;
}

/**
 * Input payload for updating user profile.
 */
export interface UpdateProfileDto {
  displayUsername?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  gender?: Gender;
  dateOfBirth?: ISODate;
  phone?: string;
  locale?: string;
  timezone?: string;
  currency?: string;
  image?: string;
}

/**
 * Input payload for changing username handle.
 */
export interface UpdateUsernameDto {
  username: string;
}

/**
 * Input payload for real-time username or email availability checks.
 */
export interface CheckAvailabilityDto {
  /** Field to check ('username' | 'email') */
  field: 'username' | 'email';
  /** Value to test */
  value: string;
}

/**
 * Outcome response of an availability check.
 */
export interface AvailabilityResponse {
  field: 'username' | 'email';
  value: string;
  available: boolean;
  message?: string;
}

/**
 * Standard successful authentication response.
 */
export interface AuthResponse {
  user: User;
  session?: Session;
  /** Bearer access token (for mobile clients) */
  token?: string;
  message?: string;
}

/**
 * Standard session response.
 */
export interface SessionResponse {
  user: User;
  session: Session;
}

/**
 * Standard machine-readable authentication error codes.
 */
export type AuthErrorCode =
  | 'UNAUTHENTICATED'
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'USER_ALREADY_EXISTS'
  | 'USERNAME_TAKEN'
  | 'EMAIL_NOT_VERIFIED'
  | 'SESSION_EXPIRED'
  | 'INVALID_SESSION_TOKEN'
  | 'PASSWORD_TOO_WEAK'
  | 'TOKEN_EXPIRED';

/**
 * Standard password strength classification tiers.
 */
export type PasswordStrengthLevel = 'too-weak' | 'weak' | 'fair' | 'good' | 'strong';

/**
 * Result of testing a single password requirement criterion.
 */
export interface PasswordRuleResult {
  message: string;
  met: boolean;
}

/**
 * Comprehensive password evaluation report for meters and strength indicators.
 */
export interface PasswordStrengthReport {
  score: number;
  level: PasswordStrengthLevel;
  label: string;
  percent: number;
  isValid: boolean;
  checklist: PasswordRuleResult[];
}
