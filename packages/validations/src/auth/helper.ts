import { z } from 'zod';
import {
  AUTH_LIMITS,
  GENDER_OPTIONS,
  SYNC_STATUS_OPTIONS,
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
} from '@kalya/types';

/**
 * Standard email validation rule with trimming and lowercasing.
 */
export const EmailSchema = z.email('Invalid email address format').trim().toLowerCase();

/**
 * Strict username validation rule matching AUTH_LIMITS.
 * Allowed: letters, numbers, and underscores (3-30 characters).
 */
export const UsernameSchema = z
  .string({ error: 'Username is required' })
  .trim()
  .toLowerCase()
  .min(
    AUTH_LIMITS.MIN_USERNAME_LENGTH,
    `Username must be at least ${AUTH_LIMITS.MIN_USERNAME_LENGTH} characters`
  )
  .max(
    AUTH_LIMITS.MAX_USERNAME_LENGTH,
    `Username cannot exceed ${AUTH_LIMITS.MAX_USERNAME_LENGTH} characters`
  )
  .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain alphanumeric characters and underscores');

/**
 * Individual criteria for strong password validation.
 * Can be shared with client applications for interactive password strength meters / checklists.
 */
export const PASSWORD_RULES = [
  { test: (p: string) => /[A-Z]/.test(p), message: 'Uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), message: 'Lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p), message: 'Number' },
  {
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
    message: 'Special character (e.g. !?<>@#$%)',
  },
  { test: (p: string) => p.length >= 8, message: '8 characters or more' },
] as const;

/**
 * Strict password validation rule matching PASSWORD_RULES and AUTH_LIMITS.
 * Applied when creating or updating passwords (Sign-Up, Reset Password, Change Password).
 */
export const PasswordSchema = z
  .string({ error: 'Password is required' })
  .min(
    AUTH_LIMITS.MIN_PASSWORD_LENGTH,
    `Password must be at least ${AUTH_LIMITS.MIN_PASSWORD_LENGTH} characters`
  )
  .max(
    AUTH_LIMITS.MAX_PASSWORD_LENGTH,
    `Password cannot exceed ${AUTH_LIMITS.MAX_PASSWORD_LENGTH} characters`
  )
  .superRefine((password, ctx) => {
    for (const rule of PASSWORD_RULES) {
      if (!rule.test(password)) {
        ctx.addIssue({
          code: 'custom',
          message: `Password must contain at least one ${rule.message.toLowerCase()}`,
        });
      }
    }
  });

/**
 * Reusable name field schema (first name, last name).
 */
export const NameSchema = z
  .string({ error: 'Name is required' })
  .trim()
  .min(AUTH_LIMITS.MIN_NAME_LENGTH, 'Name cannot be empty')
  .max(AUTH_LIMITS.MAX_NAME_LENGTH, `Name cannot exceed ${AUTH_LIMITS.MAX_NAME_LENGTH} characters`);

/**
 * Optional middle name schema.
 */
export const MiddleNameSchema = z
  .string()
  .trim()
  .max(
    AUTH_LIMITS.MAX_NAME_LENGTH,
    `Middle name cannot exceed ${AUTH_LIMITS.MAX_NAME_LENGTH} characters`
  )
  .optional();

/**
 * Optional display username styling schema.
 */
export const DisplayUsernameSchema = z
  .string()
  .trim()
  .max(
    AUTH_LIMITS.MAX_USERNAME_LENGTH,
    `Display username cannot exceed ${AUTH_LIMITS.MAX_USERNAME_LENGTH} characters`
  )
  .optional();

/**
 * User gender enum schema matching GENDER_OPTIONS.
 */
export const GenderSchema = z.enum(GENDER_OPTIONS, {
  message: 'Invalid gender selection',
});

/**
 * Sync status enum schema matching SYNC_STATUS_OPTIONS.
 */
export const SyncStatusSchema = z.enum(SYNC_STATUS_OPTIONS, {
  message: 'Invalid sync status',
});

/**
 * Date of birth ISO date schema (YYYY-MM-DD).
 */
export const DateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must follow YYYY-MM-DD format');

/**
 * Standard 3-letter uppercase currency code schema (ISO 4217).
 */
export const CurrencySchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(3, 'Currency code must be exactly 3 uppercase letters (e.g. USD, INR)');

/**
 * Standard phone number schema.
 */
export const PhoneSchema = z.string().trim().max(20, 'Phone number cannot exceed 20 characters');

/**
 * Standard locale identifier schema.
 */
export const LocaleSchema = z
  .string()
  .trim()
  .max(10, 'Locale identifier cannot exceed 10 characters');

/**
 * Standard timezone identifier schema.
 */
export const TimezoneSchema = z
  .string()
  .trim()
  .max(50, 'Timezone identifier cannot exceed 50 characters');

/**
 * Valid user role schema.
 */
export const UserRoleSchema = z.enum(USER_ROLE_OPTIONS);

/**
 * Valid user account status schema.
 */
export const UserStatusSchema = z.enum(USER_STATUS_OPTIONS);
