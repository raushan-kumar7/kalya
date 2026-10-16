import { env } from '@kalya/env';
import { VerifyEmail, VerifyEmailChange } from '@kalya/email';
import { formatDateTime } from '@kalya/utils';
import { getMailer } from '@/libs/mail';
import { log } from '@/logger';
import { resolveDisplayName, resolveUserTimezone } from '@/modules/helpers';

export interface SendVerificationEmailPayload {
  user: {
    id: string;
    email: string;
    name?: string | null;
    first_name?: string | null;
    timezone?: string | null;
  };
  url: string;
  token: string;
}

export interface SendEmailChangePayload {
  userName: string;
  currentEmail: string;
  newEmail: string;
  verificationUrl: string;
}

/**
 * Dispatches VerifyEmail template upon initial sign-up.
 *
 * @param payload - Verification email payload from Better-Auth.
 * @param _request - Inbound HTTP request.
 */
export async function handleSendVerificationEmail(
  payload: SendVerificationEmailPayload,
  _request?: Request | null
): Promise<void> {
  const { user, url, token } = payload;
  const userName = resolveDisplayName(user);
  const tz = resolveUserTimezone(user.timezone);

  const clientBaseUrl = env.app.clientUrl.replace(/\/+$/, '');
  const apiBaseUrl = (env.auth.baseUrl || env.app.clientUrl).replace(/\/+$/, '');

  const callbackURL = `${clientBaseUrl}/auth/verify-email?status=verified&email=${encodeURIComponent(user.email)}`;
  const verificationUrl = `${apiBaseUrl}/api/${env.app.apiVersion}/auth/verify-email?token=${encodeURIComponent(token)}&callbackURL=${encodeURIComponent(callbackURL)}`;

  log.info('Sending verification email', {
    action: 'SENDING_VERIFICATION_EMAIL',
    userId: user.id,
    to: user.email,
    verificationUrl,
  });

  try {
    await getMailer().sendTemplate({
      template: VerifyEmail,
      props: {
        userName,
        userEmail: user.email,
        verificationUrl,
        expiresInHours: 24,
        signUpTime: formatDateTime(new Date(), tz),
      },
      to: user.email,
      subject: 'Verify your Kalya account',
    });

    log.info('Verification email sent', {
      action: 'VERIFICATION_EMAIL_SENT',
      userId: user.id,
      to: user.email,
    });
  } catch (err) {
    log.error(err, {
      action: 'VERIFY_EMAIL_FAILED',
      userId: user.id,
      to: user.email,
    });
    throw err;
  }
}

/**
 * Dispatches VerifyEmailChange template to the newly requested email address.
 *
 * @param payload - Email change verification payload.
 */
export async function handleSendEmailChangeVerification(
  payload: SendEmailChangePayload
): Promise<void> {
  const { userName, currentEmail, newEmail, verificationUrl } = payload;

  try {
    await getMailer().sendTemplate({
      template: VerifyEmailChange,
      props: {
        userName,
        currentEmail,
        newEmail,
        verificationUrl,
        expiresInHours: 24,
      },
      to: newEmail,
      subject: 'Confirm your new email address for Kalya',
    });

    log.info('Email change verification sent', {
      action: 'EMAIL_CHANGE_VERIFICATION_SENT',
      to: newEmail,
    });
  } catch (err) {
    log.error(err, {
      action: 'EMAIL_CHANGE_VERIFICATION_FAILED',
      to: newEmail,
    });
    throw err;
  }
}
