/**
 * Valid gender selections available to user profiles.
 * Corresponds to the database-level enum representation.
 */
export const GENDER_OPTIONS = [
  'MALE',
  'FEMALE',
  'NON_BINARY',
  'PREFER_NOT_TO_SAY',
  'OTHER',
] as const;

/**
 * User self-identified gender type.
 */
export type Gender = (typeof GENDER_OPTIONS)[number];

/**
 * Synchronization state options for multi-device and offline-first clients.
 * Corresponds to the database-level sync_status column enum.
 */
export const SYNC_STATUS_OPTIONS = ['PENDING', 'SYNCED', 'CONFLICT', 'FAILED'] as const;

/**
 * Synchronization status type for tracked database entities.
 */
export type SyncStatus = (typeof SYNC_STATUS_OPTIONS)[number];

/**
 * Maximum allowed payload size for uploaded user avatars (5 MB in bytes).
 */
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

/**
 * Permitted MIME types for uploaded avatar images.
 */
export const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/**
 * Type representing valid avatar MIME types.
 */
export type AllowedAvatarMimeType = (typeof ALLOWED_AVATAR_MIME_TYPES)[number];

/**
 * Permitted file extensions for uploaded avatar images.
 */
export const ALLOWED_AVATAR_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;

/**
 * Type representing valid avatar file extensions.
 */
export type AllowedAvatarExtension = (typeof ALLOWED_AVATAR_EXTENSIONS)[number];

/**
 * Standard input length boundaries for authentication credentials and profile fields.
 */
export const AUTH_LIMITS = {
  /** Minimum character length for user handle / username */
  MIN_USERNAME_LENGTH: 3,
  /** Maximum character length for user handle / username */
  MAX_USERNAME_LENGTH: 30,
  /** Minimum character length for account password */
  MIN_PASSWORD_LENGTH: 8,
  /** Maximum character length for account password */
  MAX_PASSWORD_LENGTH: 128,
  /** Minimum character length for first / last names */
  MIN_NAME_LENGTH: 1,
  /** Maximum character length for first / last names */
  MAX_NAME_LENGTH: 100,
} as const;

/**
 * Lifecycle states during real-time field uniqueness / availability checks
 * (e.g. verifying if a username or email is already registered).
 */
export const AVAILABILITY_STATUS_OPTIONS = [
  'idle',
  'invalid',
  'checking',
  'available',
  'taken',
  'error',
] as const;

/**
 * Real-time field availability verification status.
 */
export type AvailabilityStatus = (typeof AVAILABILITY_STATUS_OPTIONS)[number];

/**
 * Outcome payload of a field availability verification request.
 */
export interface AvailabilityCheckResult {
  /** The value string that was checked for uniqueness */
  value: string;
  /** Verification outcome state */
  status: 'available' | 'taken' | 'error';
  /** Optional human-readable message or explanation */
  message?: string;
}

/**
 * Shorthand alias for `AvailabilityStatus`.
 */
export type Status = AvailabilityStatus;

/**
 * Shorthand alias for `AvailabilityCheckResult`.
 */
export type Result = AvailabilityCheckResult;
