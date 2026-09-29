import { Resend } from 'resend';
import { MailProvider, SendMailOptions, SendMailResult } from '@kalya/types';
import { InternalServerError, ServiceUnavailableError } from '@/errors';
import { log } from '@/logger';

/**
 * Resend Cloud Mail Provider implementing the central MailProvider interface.
 *
 * @description Delivers transactional emails via the Resend HTTP API SDK with resilient error handling.
 */
export class ResendMailProvider implements MailProvider {
  readonly name = 'resend';
  private readonly client: Resend;
  private readonly apiKey: string;

  /**
   * Initializes the Resend API client using the provided API key.
   *
   * @param {string} apiKey - Resend API key (e.g. `re_...`).
   * @throws {InternalServerError} If the API key is missing or blank.
   */
  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
      throw new InternalServerError(
        'Resend provider requires KALYA_MAIL.RESEND_API_KEY configuration',
        'MAIL_CONFIG_INVALID',
        { provider: 'resend' }
      );
    }

    this.apiKey = apiKey;
    this.client = new Resend(apiKey);
  }

  /**
   * Dispatches an email via the Resend REST API.
   *
   * @param {SendMailOptions} options - Outgoing email parameters including recipients, subject, and HTML body.
   * @returns {Promise<SendMailResult>} Delivery receipt containing messageId and success status.
   * @throws {InternalServerError} If Resend returns an API error or network failure occurs.
   */
  async send(options: SendMailOptions): Promise<SendMailResult> {
    try {
      const recipients = Array.isArray(options.to)
        ? options.to
        : options.to.includes(',')
          ? options.to
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [options.to];

      const { data, error } = await this.client.emails.send({
        from: options.from || 'onboarding@resend.dev',
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text,
        ...(options.replyTo ? { replyTo: options.replyTo } : {}),
        ...(options.headers ? { headers: options.headers } : {}),
      });

      if (error) {
        log.error(error.message, {
          action: 'RESEND_API_ERROR',
          errorName: error.name,
          to: options.to,
          subject: options.subject,
        });

        throw new InternalServerError(
          error.message || 'Resend failed to deliver email',
          'RESEND_SEND_FAILED',
          { errorName: error.name, to: options.to, subject: options.subject },
          error
        );
      }

      log.info('Resend email dispatched successfully', {
        messageId: data?.id,
        to: options.to,
        subject: options.subject,
      });

      return {
        messageId: data?.id ?? '',
        success: true,
      };
    } catch (err) {
      if (err instanceof InternalServerError) {
        throw err;
      }

      log.error(err, {
        action: 'RESEND_SEND_EXCEPTION',
        to: options.to,
        subject: options.subject,
      });

      throw new InternalServerError(
        err instanceof Error ? err.message : 'Unexpected failure during Resend dispatch',
        'RESEND_SEND_FAILED',
        { to: options.to, subject: options.subject },
        err
      );
    }
  }

  /**
   * Verifies Resend connectivity and credentials.
   *
   * @returns {Promise<boolean>} True if Resend credentials are valid and service is accessible.
   * @throws {ServiceUnavailableError} If the API call fails or credentials are rejected.
   */
  async verify(): Promise<boolean> {
    try {
      const { error } = await this.client.apiKeys.list();
      if (error) {
        throw new ServiceUnavailableError(
          `Resend API connectivity verification failed: ${error.message}`,
          'RESEND_CONNECTION_FAILED',
          { errorName: error.name },
          error
        );
      }
      return true;
    } catch (err) {
      if (err instanceof ServiceUnavailableError) {
        throw err;
      }

      log.error(err, { action: 'RESEND_VERIFY_EXCEPTION' });
      throw new ServiceUnavailableError(
        'Resend mail service is currently unavailable or API key is invalid',
        'RESEND_SERVICE_UNAVAILABLE',
        undefined,
        err
      );
    }
  }
}
