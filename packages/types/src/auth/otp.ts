import { OtpType } from '../core';

/** DTO for verifying an account email with an OTP code. */
export interface VerifyEmailOtpDto {
  email: string;
  otp: string;
}

/** DTO for requesting an OTP code to be sent to an email address. */
export interface SendVerificationOtpDto {
  email: string;
  type: OtpType;
}

/** DTO for resetting a password using an email and an OTP code. */
export interface ResetPasswordOtpDto {
  email: string;
  otp: string;
  password: string;
}

/** Standard API response returned by OTP operations. */
export interface OtpResponse {
  success: boolean;
  message?: string;
  status?: boolean;
}
