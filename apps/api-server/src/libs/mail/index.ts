import type { MailProvider } from '@kalya/types';
import { env } from '@kalya/env';
import { InternalServerError } from '@/errors';
import { MailerService } from './mailer.service';
import { ResendMailProvider, SmtpMailProvider } from './providers';

export * from './mailer.service';
export * from './providers';
export type {
  MailProvider,
  RenderEmailOptions,
  SendMailOptions,
  SendMailResult,
} from '@kalya/types';

/**
 * Cached singleton instance of the active MailerService.
 */
let cachedMailer: MailerService | undefined;

/**
 * Creates and initializes a MailerService instance based on application configuration.
 *
 * @description Inspects `env.mail.provider` ('resend' | 'smtp') or accepts an explicit driver override,
 * validating all necessary credentials before returning the configured MailerService.
 *
 * @param {MailProvider | 'smtp' | 'resend'} [providerOverride] - Optional custom driver instance or provider name override.
 * @returns {MailerService} Configured MailerService ready for email dispatch.
 * @throws {InternalServerError} If credentials for the selected provider are incomplete or provider is unsupported.
 */
export function createMailer(providerOverride?: MailProvider | 'smtp' | 'resend'): MailerService {
  if (providerOverride && typeof providerOverride === 'object') {
    return new MailerService(providerOverride);
  }

  const providerType = providerOverride ?? env.mail.provider;

  if (providerType === 'resend') {
    const apiKey = env.mail.resendApiKey;
    if (!apiKey) {
      throw new InternalServerError(
        'KALYA_MAIL.PROVIDER=resend requires KALYA_MAIL.RESEND_API_KEY to be set in environment variables',
        'MAIL_CONFIG_INVALID',
        { provider: 'resend' }
      );
    }
    return new MailerService(new ResendMailProvider(apiKey), env.mail.from);
  }

  if (providerType === 'smtp') {
    const smtpConfig = env.smtp;
    if (!smtpConfig?.host || !smtpConfig?.port) {
      throw new InternalServerError(
        'KALYA_MAIL.PROVIDER=smtp requires KALYA_SMTP.HOST and KALYA_SMTP.PORT to be configured',
        'MAIL_CONFIG_INVALID',
        { provider: 'smtp', host: smtpConfig?.host, port: smtpConfig?.port }
      );
    }
    return new MailerService(new SmtpMailProvider(smtpConfig), env.mail.from);
  }

  throw new InternalServerError(
    `Unsupported mail provider: "${String(providerType)}". Valid options are "smtp" or "resend".`,
    'MAIL_PROVIDER_UNSUPPORTED',
    { provider: providerType }
  );
}

/**
 * Retrieves the application-wide singleton instance of the active MailerService.
 *
 * @description Lazily initializes and caches the active MailerService singleton for shared access across server services, plugins, and auth hooks.
 *
 * @returns {MailerService} Singleton MailerService instance.
 */
export function getMailer(): MailerService {
  if (!cachedMailer) {
    cachedMailer = createMailer();
  }
  return cachedMailer;
}

/**
 * Resets the cached mailer singleton.
 *
 * @description Clears the cached mailer singleton to allow clean driver recreation during test fixtures and isolated suites.
 */
export function resetMailerCache(): void {
  cachedMailer = undefined;
}

/**
 * Gracefully terminates the active mailer transport connections and clears the cached instance.
 */
export function closeMailer(): void {
  if (cachedMailer) {
    cachedMailer.close();
    cachedMailer = undefined;
  }
}
