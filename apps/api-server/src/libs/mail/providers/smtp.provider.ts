import nodemailer, { type Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { AppConfig, MailProvider, SendMailOptions, SendMailResult } from '@kalya/types';
import { InternalServerError, ServiceUnavailableError } from '@/errors';
import { log } from '@/logger';

/**
 * SMTP Mail Provider implementing the central MailProvider interface via Nodemailer.
 *
 * @description Manages SMTP connections, authenticates using environment configuration,
 * dispatches outgoing emails, and provides connection verification diagnostics.
 */
export class SmtpMailProvider implements MailProvider {
  readonly name = 'smtp';
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;

  /**
   * Initializes the SMTP transporter with host, port, credentials, and TLS settings.
   *
   * @param {AppConfig['smtp']} config - The SMTP configuration settings from AppConfig.
   * @throws {InternalServerError} If host, port, user, or password configuration is missing.
   */
  constructor(private readonly config: AppConfig['smtp']) {
    const { host, port, user, password, secure } = config ?? {};

    if (!host || !port || !user || !password) {
      throw new InternalServerError(
        'SMTP config requires host, port, user and password',
        'MAIL_CONFIG_INVALID',
        { provider: 'smtp', host, port }
      );
    }

    const isSecure = String(secure) === 'true'; // true -> 465, false -> 587 (STARTTLS)

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: isSecure,
      requireTLS: !isSecure,
      auth: { user, pass: password },
    });
  }

  /**
   * Dispatches an email via the configured SMTP transport.
   *
   * @param {SendMailOptions} options - Outgoing email parameters including recipients, subject, and body.
   * @returns {Promise<SendMailResult>} Delivery receipt containing messageId and success status.
   * @throws {InternalServerError} If the SMTP transport fails during transmission.
   */
  async send(options: SendMailOptions): Promise<SendMailResult> {
    try {
      const info = await this.transporter.sendMail({
        // Gmail only allows the authenticated account as sender
        from: options.from || this.config.email || this.config.user,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        headers: options.headers,
      });

      log.info('SMTP email sent', { messageId: info.messageId, to: options.to });
      return { messageId: info.messageId, success: true };
    } catch (err) {
      log.error(err, { action: 'SMTP_SEND_FAILED', to: options.to, subject: options.subject });
      throw new InternalServerError(
        err instanceof Error ? err.message : 'SMTP email delivery failed',
        'SMTP_SEND_FAILED',
        { to: options.to, subject: options.subject },
        err
      );
    }
  }

  /**
   * Verifies SMTP connection and authentication health.
   *
   * @returns {Promise<boolean>} True if the SMTP server is reachable and credentials are valid.
   * @throws {ServiceUnavailableError} If the connection cannot be established or authentication fails.
   */
  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (err) {
      log.error(err, { action: 'SMTP_VERIFY_FAILED' });
      throw new ServiceUnavailableError(
        'SMTP connection or authentication failed',
        'SMTP_CONNECTION_FAILED',
        { host: this.config.host, port: this.config.port },
        err
      );
    }
  }

  /**
   * Closes active idle SMTP socket connections.
   */
  close(): void {
    this.transporter.close();
  }
}
