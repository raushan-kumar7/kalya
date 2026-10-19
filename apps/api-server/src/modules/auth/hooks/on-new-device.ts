import { and, type DatabaseClient, desc, eq, ne, schema } from '@kalya/db';
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
 * Inspects newly created sessions for unrecognized devices, browsers, or IP addresses.
 *
 * Dispatches BOTH:
 * 1. An in-app alert into `schema.alert` (visible in user's notification center).
 * 2. A transactional security email (`NewDeviceLogin`).
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
    // 1. Parse client intelligence; suppress alerts for automated bots / crawlers
    const client = parseClientInfo(userAgent, ipAddress);
    if (client.bot.isBot) {
      log.debug('Skipping new-device check: automated bot crawler detected', { userId });
      return;
    }

    // 2. Retrieve user identity and account age
    const [user] = await db
      .select({
        id: schema.user.id,
        email: schema.user.email,
        name: schema.user.name,
        firstName: schema.user.first_name,
        timezone: schema.user.timezone,
        createdAt: schema.user.createdAt,
      })
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (!user || !user.email) {
      return;
    }

    // 3. Fetch user's prior sessions excluding the currently initiated session
    const priorSessions = await db
      .select({
        id: schema.session.id,
        ipAddress: schema.session.ipAddress,
        userAgent: schema.session.userAgent,
        createdAt: schema.session.createdAt,
      })
      .from(schema.session)
      .where(and(eq(schema.session.userId, userId), ne(schema.session.id, currentSessionId)))
      .limit(15);

    // 4. Initial Sign-Up Guard:
    // If the account was created less than 90 seconds ago and there are no prior sessions,
    // this is the initial registration session (Welcome email handles this).
    const accountAgeMs = user.createdAt ? Date.now() - new Date(user.createdAt).getTime() : 0;
    if (accountAgeMs < 90_000 && priorSessions.length === 0) {
      log.debug('Skipping new-device alert: initial sign-up session for newly created account', {
        userId,
        accountAgeMs,
      });
      return;
    }

    // 5. Construct normalized device signature
    // e.g. "macos_chrome_desktop" or "ios_safari_mobile"
    const currentSignature = `${client.os.name}_${client.browser.name}_${client.device.type}`
      .toLowerCase()
      .replace(/\s+/g, '_');

    const normalizedCurrentIp =
      client.network.ipAddress !== 'Unknown IP'
        ? client.network.ipAddress
        : ipAddress?.trim() || 'Unknown IP';

    // 6. Check historical alerts to detect previously recognized devices and avoid alert fatigue
    const recentAlerts = await db
      .select({
        id: schema.alert.id,
        metadata: schema.alert.metadata,
        createdAt: schema.alert.createdAt,
      })
      .from(schema.alert)
      .where(
        and(eq(schema.alert.userId, userId), eq(schema.alert.referenceType, 'new_device_login'))
      )
      .orderBy(desc(schema.alert.createdAt))
      .limit(10);

    // Check if the current device signature matches any prior active session
    const matchesActiveSession = priorSessions.some((s) => {
      if (!s.userAgent) return false;
      const priorClient = parseClientInfo(s.userAgent, s.ipAddress);
      const priorSig =
        `${priorClient.os.name}_${priorClient.browser.name}_${priorClient.device.type}`
          .toLowerCase()
          .replace(/\s+/g, '_');

      const sameDevice = priorSig === currentSignature;
      // In production, also verify IP or subnet. In local development, IP is always 127.0.0.1
      const sameNetwork = env.isLocal || priorClient.network.ipAddress === normalizedCurrentIp;

      return sameDevice && sameNetwork;
    });

    // Check if an alert was already triggered for this exact device recently (within last 12 hours)
    const matchesRecentAlert = recentAlerts.some((a) => {
      const meta = a.metadata as Record<string, unknown> | undefined;
      const sameDevice = meta?.deviceSignature === currentSignature;
      const alertTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const isRecent = Date.now() - alertTime < 12 * 60 * 60 * 1000; // 12 hours

      return sameDevice && isRecent;
    });

    // If device is already recognized and active or recently alerted, do not re-alert
    if (matchesActiveSession || matchesRecentAlert) {
      log.debug('Skipping new-device alert: recognized device and network', {
        userId,
        currentSignature,
        normalizedCurrentIp,
      });
      return;
    }

    // 7. NEW DEVICE DETECTED!
    const userName = resolveDisplayName(user);
    const tz = resolveUserTimezone(user.timezone || client.geo.timezone);
    const browserLabel =
      client.browser.name + (client.browser.version ? ` ${client.browser.version}` : '');
    const locationLabel = client.geo.location || 'Unknown Location';

    log.info('New device sign-in detected! Creating in-app alert and sending security email', {
      action: 'NEW_DEVICE_DETECTED',
      userId,
      device: client.device.label,
      browser: browserLabel,
      ip: normalizedCurrentIp,
      location: locationLabel,
    });

    // 8. Insert In-App Alert into schema.alert (for dashboard notification bell)
    try {
      await db.insert(schema.alert).values({
        userId,
        type: 'system',
        title: 'New Sign-In Detected 🔔',
        message: `New sign-in from ${client.device.label} using ${browserLabel} (${locationLabel}).`,
        isRead: false,
        referenceType: 'new_device_login',
        referenceId: null,
        metadata: {
          deviceSignature: currentSignature,
          device: client.device.label,
          browser: browserLabel,
          ipAddress: normalizedCurrentIp,
          location: locationLabel,
          loginTime: new Date().toISOString(),
        },
      });
    } catch (dbErr) {
      log.error('Failed to insert in-app new-device alert record', { userId, dbErr });
    }

    // 9. Dispatch Transactional Security Alert Email
    await getMailer().sendTemplate({
      template: NewDeviceLogin,
      props: {
        userName,
        userEmail: user.email,
        loginTime: formatDateTime(new Date(), tz),
        device: client.device.label,
        browser: browserLabel,
        ipAddress: normalizedCurrentIp,
        location: locationLabel,
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
