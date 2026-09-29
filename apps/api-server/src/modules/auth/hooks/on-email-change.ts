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
  const { user, url } = payload;
  const userName = resolveDisplayName(user);
  const tz = resolveUserTimezone(user.timezone);

  void getMailer()
    .sendTemplate({
      template: VerifyEmail,
      props: {
        userName,
        userEmail: user.email,
        verificationUrl: url,
        expiresInHours: 24,
        signUpTime: formatDateTime(new Date(), tz),
      },
      to: user.email,
      subject: 'Verify your Kalya account',
    })
    .catch((err) => {
      log.error(err, {
        action: 'VERIFY_EMAIL_FAILED',
        userId: user.id,
        to: user.email,
      });
    });
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

  void getMailer()
    .sendTemplate({
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
    })
    .catch((err) => {
      log.error(err, {
        action: 'EMAIL_CHANGE_VERIFICATION_FAILED',
        to: newEmail,
      });
    });
}
