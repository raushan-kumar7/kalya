import { getMailer } from '@/libs/mail';
import { log } from '@/logger';
import { parseClientInfo } from '@/modules/helpers';
import { ResetPassword, TwoFactorCode, VerifyEmail } from '@kalya/email';
import { env } from '@kalya/env';
import { AUTH_LIMITS } from '@kalya/types';
import { formatDateTime, Temporal } from '@kalya/utils';

interface SendOtpPayload {
  email: string;
  otp: string;
}

interface TwoFactorPayload {
  user: { name?: string | null; email: string; timezone?: string | null };
  otp: string;
}

/** Better-Auth passes either a Request (older versions) or an endpoint context (newer). */
type OtpContext = Request | { request?: Request } | null | undefined;

const DEFAULT_TIMEZONE = 'Asia/Kolkata';

const getRequest = (ctx?: OtpContext): Request | undefined =>
  ctx instanceof Request ? ctx : (ctx?.request ?? undefined);

/** Returns the IANA timezone if valid, otherwise the default. Never throws. */
const safeTimezone = (tz?: string | null): string => {
  if (!tz) return DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return tz;
  } catch {
    return DEFAULT_TIMEZONE;
  }
};

/** Short timezone label for a zone, e.g. "GMT+5:30". */
const getTimezoneLabel = (tz: string): string =>
  new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
    .formatToParts(new Date())
    .find((part) => part.type === 'timeZoneName')?.value ?? tz;

/** "Oct 29, 2026 at 2:18 PM GMT+5:30" in the given timezone. */
const formatNow = (tz?: string | null): string => {
  const zone = safeTimezone(tz);
  return `${formatDateTime(Temporal.Now.instant(), zone)} ${getTimezoneLabel(zone)}`;
};

const getClientBaseUrl = (): string => env.app.clientUrl.replace(/\/+$/, '');

const getDisplayName = (email: string): string => email.split('@')[0] ?? email;

const getClientIp = (ctx?: OtpContext): string => {
  const request = getRequest(ctx);
  const client = parseClientInfo(
    request?.headers?.get('user-agent'),
    request?.headers?.get('x-forwarded-for'),
    request?.headers
  );
  return client.network.ipAddress;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/** Sends the email-verification OTP (signup and unverified sign-in). */
export async function handleSendVerificationOTP(
  payload: SendOtpPayload,
  _ctx?: OtpContext
): Promise<void> {
  const { email, otp } = payload;
  // The web page reads the email from the query string, so the user only types the code.
  const verificationUrl = `${getClientBaseUrl()}/auth/verify-email?email=${encodeURIComponent(email)}`;

  log.info('Dispatching email verification OTP', {
    action: 'SEND_VERIFICATION_OTP',
    to: email,
    ...(env.isLocal || env.isDev ? { debugOtp: otp } : {}),
  });

  try {
    await getMailer().sendTemplate({
      to: email,
      subject: `Your Kalya verification code is ${otp}`,
      template: VerifyEmail,
      props: {
        userName: getDisplayName(email),
        userEmail: email,
        verificationUrl,
        otpCode: otp,
        expiresInMinutes: AUTH_LIMITS.OTP_EXPIRES_MINUTES,
        signUpTime: formatNow(),
      },
    });
  } catch (error) {
    log.error('Failed to send verification OTP email', {
      action: 'SEND_VERIFICATION_OTP_FAILED',
      to: email,
      error: getErrorMessage(error),
    });
  }
}

/** Sends the password-reset OTP (`forget-password`). */
export async function handleSendPasswordResetOTP(
  payload: SendOtpPayload,
  ctx?: OtpContext
): Promise<void> {
  const { email, otp } = payload;
  const resetUrl = `${getClientBaseUrl()}/auth/reset-password?email=${encodeURIComponent(email)}`;

  log.info('Dispatching password reset OTP', {
    action: 'SEND_PASSWORD_RESET_OTP',
    to: email,
    ...(env.isLocal || env.isDev ? { debugOtp: otp } : {}),
  });

  try {
    await getMailer().sendTemplate({
      to: email,
      subject: `Your Kalya password reset code is ${otp}`,
      template: ResetPassword,
      props: {
        userName: getDisplayName(email),
        userEmail: email,
        resetUrl,
        otpCode: otp,
        expiresInMinutes: AUTH_LIMITS.OTP_EXPIRES_MINUTES,
        requestedTime: formatNow(),
        ipAddress: getClientIp(ctx),
      },
    });
  } catch (error) {
    log.error('Failed to send password reset OTP email', {
      action: 'SEND_PASSWORD_RESET_OTP_FAILED',
      to: email,
      error: getErrorMessage(error),
    });
  }
}

/** For the Better-Auth `twoFactor` plugin's `otpOptions.sendOTP`. */
export async function handleSendTwoFactorOTP(
  payload: TwoFactorPayload,
  ctx?: OtpContext
): Promise<void> {
  const { user, otp } = payload;

  log.info('Dispatching two-factor OTP', {
    action: 'SEND_TWO_FACTOR_OTP',
    to: user.email,
  });

  try {
    await getMailer().sendTemplate({
      to: user.email,
      subject: `Your Kalya two-factor code is ${otp}`,
      template: TwoFactorCode,
      props: {
        userName: user.name || getDisplayName(user.email),
        userEmail: user.email,
        otpCode: otp,
        expiresInMinutes: AUTH_LIMITS.MFA_OTP_EXPIRES_MINUTES,
        requestedTime: formatNow(user.timezone),
        ipAddress: getClientIp(ctx),
      },
    });
  } catch (error) {
    log.error('Failed to send two-factor OTP email', {
      action: 'SEND_TWO_FACTOR_OTP_FAILED',
      to: user.email,
      error: getErrorMessage(error),
    });
  }
}
