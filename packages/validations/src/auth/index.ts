import { z } from 'zod';
import {
  Account,
  AuthResponse,
  AvailabilityResponse,
  ChangePasswordDto,
  CheckAvailabilityDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  Session,
  SessionResponse,
  SignInDto,
  SignUpDto,
  UpdateProfileDto,
  UpdateUsernameDto,
  User,
  Verification,
} from '@kalya/types';
import {
  CurrencySchema,
  DateOfBirthSchema,
  DisplayUsernameSchema,
  EmailSchema,
  GenderSchema,
  LocaleSchema,
  MiddleNameSchema,
  NameSchema,
  PasswordSchema,
  PhoneSchema,
  SyncStatusSchema,
  TimezoneSchema,
  UsernameSchema,
} from './helper';
import { ISOTimestampSchema } from '../core';

/**
 * Schema for user sign up with email and password.
 */
export const SignUpSchema: z.ZodType<SignUpDto> = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  username: UsernameSchema,
  first_name: NameSchema,
  last_name: NameSchema,
  middle_name: MiddleNameSchema,
  displayUsername: DisplayUsernameSchema,
  gender: GenderSchema.optional(),
  dateOfBirth: DateOfBirthSchema.optional(),
  phone: PhoneSchema.optional(),
  locale: LocaleSchema.optional(),
  timezone: TimezoneSchema.optional(),
  currency: CurrencySchema.optional(),
  image: z.url('Avatar must be a valid URL').optional(),
});

/**
 * Schema for user sign in with email/username identifier and password.
 */
export const SignInSchema: z.ZodType<SignInDto> = z.object({
  identifier: z
    .string({ error: 'Identifier is required' })
    .trim()
    .min(1, 'Email or username is required'),
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

/**
 * Schema for initiating a forgot password workflow.
 */
export const ForgotPasswordSchema: z.ZodType<ForgotPasswordDto> = z.object({
  email: EmailSchema,
  redirectTo: z.url('Redirect URL must be valid').optional(),
});

/**
 * Schema for completing password reset using an email verification token.
 */
export const ResetPasswordSchema: z.ZodType<ResetPasswordDto> = z.object({
  token: z.string({ error: 'Reset token is required' }).min(1, 'Reset token cannot be empty'),
  newPassword: PasswordSchema,
});

/**
 * Schema for changing password when authenticated.
 */
export const ChangePasswordSchema: z.ZodType<ChangePasswordDto> = z.object({
  currentPassword: z
    .string({ error: 'Current password is required' })
    .min(1, 'Current password cannot be empty'),
  newPassword: PasswordSchema,
  revokeOtherSessions: z.boolean().optional(),
});

/**
 * Schema for verifying an email address.
 */
export const VerifyEmailSchema = z.object({
  token: z
    .string({ error: 'Verification token is required' })
    .min(1, 'Verification token cannot be empty'),
});

/**
 * Schema for updating user profile fields.
 */
export const UpdateProfileSchema: z.ZodType<UpdateProfileDto> = z.object({
  displayUsername: DisplayUsernameSchema,
  first_name: NameSchema.optional(),
  middle_name: MiddleNameSchema,
  last_name: NameSchema.optional(),
  gender: GenderSchema.optional(),
  dateOfBirth: DateOfBirthSchema.optional(),
  phone: PhoneSchema.optional(),
  locale: LocaleSchema.optional(),
  timezone: TimezoneSchema.optional(),
  currency: CurrencySchema.optional(),
  image: z.url('Avatar must be a valid URL').optional(),
});

/**
 * Schema for updating the user's primary username handle.
 */
export const UpdateUsernameSchema: z.ZodType<UpdateUsernameDto> = z.object({
  username: UsernameSchema,
});

/**
 * Schema for real-time field availability/uniqueness checks.
 */
export const CheckAvailabilitySchema: z.ZodType<CheckAvailabilityDto> = z.object({
  field: z.enum(['username', 'email'], {
    message: 'Field must be either "username" or "email"',
  }),
  value: z.string({ error: 'Value to check is required' }).trim().min(1, 'Value cannot be empty'),
});

/**
 * Serialization schema for the core User entity.
 */
export const UserSchema: z.ZodType<User> = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  username: z.string(),
  displayUsername: z.string().nullable().optional(),
  first_name: z.string(),
  middle_name: z.string().nullable().optional(),
  last_name: z.string(),
  gender: GenderSchema.nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  locale: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  sync_status: SyncStatusSchema,
  createdAt: ISOTimestampSchema,
  updatedAt: ISOTimestampSchema,
});

/**
 * Serialization schema for the Session entity.
 */
export const SessionSchema: z.ZodType<Session> = z.object({
  id: z.string(),
  userId: z.string(),
  token: z.string(),
  expiresAt: ISOTimestampSchema,
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  impersonatedBy: z.string().nullable().optional(),
  createdAt: ISOTimestampSchema,
  updatedAt: ISOTimestampSchema,
});

/**
 * Serialization schema for the linked Account entity.
 */
export const AccountSchema: z.ZodType<Account> = z.object({
  id: z.string(),
  userId: z.string(),
  providerId: z.string(),
  accountId: z.string(),
  issuer: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  accessToken: z.string().nullable().optional(),
  refreshToken: z.string().nullable().optional(),
  idToken: z.string().nullable().optional(),
  accessTokenExpiresAt: ISOTimestampSchema.nullable().optional(),
  refreshTokenExpiresAt: ISOTimestampSchema.nullable().optional(),
  scope: z.string().nullable().optional(),
  createdAt: ISOTimestampSchema,
  updatedAt: ISOTimestampSchema,
});

/**
 * Serialization schema for the Verification record.
 */
export const VerificationSchema: z.ZodType<Verification> = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: ISOTimestampSchema,
  createdAt: ISOTimestampSchema,
  updatedAt: ISOTimestampSchema,
});

/**
 * Serialization schema for the standard authentication response.
 */
export const AuthResponseSchema: z.ZodType<AuthResponse> = z.object({
  user: UserSchema,
  session: SessionSchema,
  token: z.string().optional(),
  message: z.string().optional(),
});

/**
 * Serialization schema for the session verification response.
 */
export const SessionResponseSchema: z.ZodType<SessionResponse> = z.object({
  user: UserSchema,
  session: SessionSchema,
});

/**
 * Serialization schema for availability check results.
 */
export const AvailabilityResponseSchema: z.ZodType<AvailabilityResponse> = z.object({
  field: z.enum(['username', 'email']),
  value: z.string(),
  available: z.boolean(),
  message: z.string().optional(),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdateUsernameInput = z.infer<typeof UpdateUsernameSchema>;
export type CheckAvailabilityInput = z.infer<typeof CheckAvailabilitySchema>;
export type UserOutput = z.infer<typeof UserSchema>;
export type SessionOutput = z.infer<typeof SessionSchema>;
export type AuthResponseOutput = z.infer<typeof AuthResponseSchema>;

export * from './helper';
