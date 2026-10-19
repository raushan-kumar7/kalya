import { and, type DatabaseClient, eq, schema } from '@kalya/db';
import { env } from '@kalya/env';
import { Welcome } from '@kalya/email';
import { getMailer } from '@/libs/mail';
import { log } from '@/logger';
import { resolveDisplayName } from '@/modules/helpers';

export interface WelcomeUserContext {
  id: string;
  email: string;
  emailVerified?: boolean | number | null;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

/**
 * Triggers the Welcome transactional email and in-app system alert once a user account
 * becomes verified (either via email confirmation link or OAuth provider).
 *
 * Guarantees strict single-execution idempotency: checks the `alert` table for an existing
 * `welcome_email` record before dispatching to ensure it runs ONLY the first time.
 *
 * @param db - Drizzle database client.
 * @param user - User object from Better-Auth lifecycle hook.
 */
export async function handleWelcomeEmail(
  db: DatabaseClient,
  user: WelcomeUserContext
): Promise<void> {
  // 1. Guard: Ensure user has a valid email and is verified
  if (!user.email || !user.emailVerified) {
    return;
  }

  try {
    // 2. Idempotency Check: Verify if welcome notification was already generated
    const existingWelcomeAlert = await db
      .select({ id: schema.alert.id })
      .from(schema.alert)
      .where(and(eq(schema.alert.userId, user.id), eq(schema.alert.referenceType, 'welcome_email')))
      .limit(1);

    if (existingWelcomeAlert.length > 0) {
      // Welcome email has already been dispatched previously; prevent duplicates
      return;
    }

    // 3. Atomically record the welcome alert as an in-app system notification
    await db.insert(schema.alert).values({
      userId: user.id,
      type: 'system',
      title: 'Welcome to Kalya! ✨',
      message:
        'Your account is officially verified. Start by allocating your monthly income across Needs, Wants, and Savings.',
      isRead: false,
      referenceType: 'welcome_email',
      metadata: {
        welcomeSentAt: new Date().toISOString(),
        channel: 'email',
      },
    });

    // 4. Send the Welcome email template
    const userName = resolveDisplayName(user);
    const clientBaseUrl = env.app.clientUrl.replace(/\/+$/, '');
    const dashboardUrl = `${clientBaseUrl}/dashboard`;

    log.info('Dispatching Welcome Email to newly verified user', {
      action: 'DISPATCHING_WELCOME_EMAIL',
      userId: user.id,
      to: user.email,
    });

    await getMailer().sendTemplate({
      template: Welcome,
      props: {
        userName,
        userEmail: user.email,
        dashboardUrl,
        supportEmail: 'support@kalya.io',
      },
      to: user.email,
      subject: `Welcome to Kalya, ${userName}! ✨`,
    });

    log.info('Welcome Email successfully sent', {
      action: 'WELCOME_EMAIL_SENT',
      userId: user.id,
      to: user.email,
    });
  } catch (err) {
    log.error(err instanceof Error ? err : new Error(String(err)), {
      action: 'WELCOME_EMAIL_FAILED',
      userId: user.id,
      to: user.email,
    });
  }
}
