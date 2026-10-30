import { z } from 'zod';
import {
  AUTH_LIMITS,
  OTP_TYPE_OPTIONS,
  ResetPasswordOtpDto,
  SendVerificationOtpDto,
  VerifyEmailOtpDto,
} from '@kalya/types';
import { EmailSchema, PasswordSchema } from './helper';

export const OtpSchema = z
  .string({ error: 'Verification code is required' })
  .trim()
  .regex(
    new RegExp(`^\\d{${AUTH_LIMITS.OTP_LENGTH}}$`),
    `Enter the ${AUTH_LIMITS.OTP_LENGTH}-digit code`
  );

export const SendVerificationOtpSchema: z.ZodType<SendVerificationOtpDto> = z.object({
  email: EmailSchema,
  type: z.enum(OTP_TYPE_OPTIONS),
});

export const VerifyEmailOtpSchema: z.ZodType<VerifyEmailOtpDto> = z.object({
  email: EmailSchema,
  otp: OtpSchema,
});

// API payload (no confirm field, matches the DTO)
export const ResetPasswordOtpSchema: z.ZodType<ResetPasswordOtpDto> = z.object({
  email: EmailSchema,
  otp: OtpSchema,
  password: PasswordSchema,
});

// Form-only schema: the payload plus the confirm field
export const ResetPasswordOtpFormSchema = z
  .object({
    email: EmailSchema,
    otp: OtpSchema,
    password: PasswordSchema,
    confirmPassword: z.string({ error: 'Please confirm your password' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SendVerificationOtpInput = z.infer<typeof SendVerificationOtpSchema>;
export type VerifyEmailOtpInput = z.infer<typeof VerifyEmailOtpSchema>;
export type ResetPasswordOtpInput = z.infer<typeof ResetPasswordOtpSchema>;
export type ResetPasswordOtpFormInput = z.infer<typeof ResetPasswordOtpFormSchema>;
