import { type DatabaseClient, eq, schema } from '@kalya/db';
import { env } from '@kalya/env';
import { PasswordChangedNotice, ResetPassword } from '@kalya/email';
import { formatDateTime } from '@kalya/utils';
import { getMailer } from '@/libs/mail';
import { log } from '@/logger';
import { parseClientInfo, resolveDisplayName, resolveUserTimezone } from '@/modules/helpers';

export interface SendResetPasswordPayload {
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

export interface PasswordChangedContext {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Dispatches the ResetPassword template with a secure, time-sensitive token link.
 *
 * @param payload - Reset password payload from Better-Auth callback.
 * @param request - Optional inbound HTTP request.
 */
export async function handleSendResetPassword(
  payload: SendResetPasswordPayload,
  request?: Request | null
): Promise<void> {
  const { user, url, token } = payload;
  const client = parseClientInfo(
    request?.headers?.get('user-agent'),
    request?.headers?.get('x-forwarded-for'),
    request?.headers
  );
  const ip =
    client.network.ipAddress !== 'Unknown IP'
      ? client.network.ipAddress
      : request?.headers?.get('x-forwarded-for') || 'Unknown IP';
  const userName = resolveDisplayName(user);
  const tz = resolveUserTimezone(user.timezone || client.geo.timezone);

  const clientBaseUrl = env.app.clientUrl.replace(/\/+$/, '');
  const resetUrl = `${clientBaseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

  log.info('Sending password reset email', {
    action: 'SENDING_RESET_PASSWORD_EMAIL',
    userId: user.id,
    to: user.email,
    resetUrl,
  });

  try {
    await getMailer().sendTemplate({
      template: ResetPassword,
      props: {
        userName,
        userEmail: user.email,
        resetUrl,
        expiresInMinutes: 30,
        requestedAt: formatDateTime(new Date(), tz),
        ipAddress: String(ip),
      },
      to: user.email,
      subject: 'Reset your Kalya account password',
    });
    log.info('Password reset email sent', {
      action: 'RESET_PASSWORD_EMAIL_SENT',
      userId: user.id,
      to: user.email,
    });
  } catch (err) {
    log.error(err, {
      action: 'RESET_PASSWORD_EMAIL_FAILED',
      userId: user.id,
      to: user.email,
    });
  }
}

/**
 * Dispatches the PasswordChangedNotice template after a password is updated or reset.
 *
 * @param db - Drizzle database client.
 * @param context - Context including user ID, IP address, and user-agent.
 */
export async function handlePasswordChanged(
  db: DatabaseClient,
  context: PasswordChangedContext
): Promise<void> {
  const { userId, ipAddress, userAgent } = context;

  try {
    const [user] = await db
      .select({
        id: schema.user.id,
        email: schema.user.email,
        name: schema.user.name,
        firstName: schema.user.first_name,
        timezone: schema.user.timezone,
      })
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (!user || !user.email) return;

    const client = parseClientInfo(userAgent, ipAddress);
    const userName = resolveDisplayName(user);
    const clientDevice = client.device.label;
    const clientIp =
      client.network.ipAddress !== 'Unknown IP'
        ? client.network.ipAddress
        : ipAddress || 'Unknown IP';
    const tz = resolveUserTimezone(user.timezone || client.geo.timezone);

    void getMailer()
      .sendTemplate({
        template: PasswordChangedNotice,
        props: {
          userName,
          userEmail: user.email,
          changedAt: formatDateTime(new Date(), tz),
          device: clientDevice,
          ipAddress: clientIp,
          supportUrl: `${env.app.clientUrl}/security/compromised`,
        },
        to: user.email,
        subject: 'Security Alert: Your Kalya password was changed',
      })
      .catch((err) => {
        log.error(err, {
          action: 'PASSWORD_CHANGED_EMAIL_FAILED',
          userId,
          to: user.email,
        });
      });
  } catch (err) {
    log.error(err, {
      action: 'PASSWORD_CHANGED_NOTIFICATION_ERROR',
      userId,
    });
  }
}
