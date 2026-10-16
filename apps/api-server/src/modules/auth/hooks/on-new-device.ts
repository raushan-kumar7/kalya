import { and, type DatabaseClient, eq, ne, schema } from '@kalya/db';
import { env } from '@kalya/env';
import { NewDeviceLogin } from '@kalya/email';
import { formatDateTime } from '@kalya/utils';
import { getMailer } from '@/libs/mail';
import { log } from '@/logger';
import { parseClientInfo, resolveDisplayName, resolveUserTimezone } from '@/modules/helpers';

export interface NewDeviceContext {
  userId: string;
  currentSessionId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Inspects a newly created session for an unrecognized IP address or client device.
 * Triggers the NewDeviceLogin transactional email asynchronously when suspicious activity is detected.
 *
 * @param db - Drizzle database client.
 * @param context - Session metadata including user ID, current session ID, IP, and user-agent.
 */
export async function handleNewDeviceLogin(
  db: DatabaseClient,
  context: NewDeviceContext
): Promise<void> {
  const { userId, currentSessionId, ipAddress, userAgent } = context;

  try {
    // 1. Parse client intelligence; suppress alerts for automated bots / scrapers
    const client = parseClientInfo(userAgent, ipAddress);
    if (client.bot.isBot) {
      return;
    }

    // 2. Fetch user's prior sessions excluding the currently initiated session
    const priorSessions = await db
      .select({
        id: schema.session.id,
        ipAddress: schema.session.ipAddress,
        userAgent: schema.session.userAgent,
      })
      .from(schema.session)
      .where(and(eq(schema.session.userId, userId), ne(schema.session.id, currentSessionId)))
      .limit(10);

    // If no prior session exists, this is the user's initial login (do not alarm)
    if (priorSessions.length === 0) {
      return;
    }

    // 3. Determine if the current IP has already been registered in recent sessions
    const normalizedCurrentIp =
      client.network.ipAddress !== 'Unknown IP'
        ? client.network.ipAddress
        : ipAddress?.trim() || 'Unknown IP';
    const isKnownIp = priorSessions.some(
      (s) => s.ipAddress && s.ipAddress.trim() === normalizedCurrentIp
    );

    if (isKnownIp) {
      return;
    }

    // 4. New IP detected: Retrieve user identity for personalized email
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

    if (!user || !user.email) {
      return;
    }

    const userName = resolveDisplayName(user);
    const tz = resolveUserTimezone(user.timezone || client.geo.timezone);
    const browserLabel =
      client.browser.name + (client.browser.version ? ` ${client.browser.version}` : '');

    // 5. Dispatch security alert
    await getMailer().sendTemplate({
      template: NewDeviceLogin,
      props: {
        userName,
        userEmail: user.email,
        loginTime: formatDateTime(new Date(), tz),
        device: client.device.label,
        browser: browserLabel,
        ipAddress: normalizedCurrentIp,
        location: client.geo.location,
        revokeSessionsUrl: `${env.app.clientUrl}/settings/security`,
      },
      to: user.email,
      subject: 'Security Alert: New sign-in detected on your Kalya account',
    });

    log.info('New device login security alert email sent', {
      action: 'NEW_DEVICE_EMAIL_SENT',
      userId,
      to: user.email,
    });
  } catch (err) {
    log.error(err, {
      action: 'NEW_DEVICE_DETECTION_ERROR',
      userId,
    });
  }
}
