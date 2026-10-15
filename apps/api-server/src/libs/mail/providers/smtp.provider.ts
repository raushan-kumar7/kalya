import dns from 'node:dns';
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
  private readonly config: AppConfig['smtp'];

  /**
   * Initializes the SMTP transporter with host, port, credentials, and TLS settings.
   *
   * @param {AppConfig['smtp']} config - The SMTP configuration settings from AppConfig.
   * @throws {InternalServerError} If SMTP host/port is missing or credentials are incomplete.
   */
  constructor(config: AppConfig['smtp']) {
    if (!config?.host || !config?.port) {
      throw new InternalServerError(
        'SMTP provider requires KALYA_SMTP.HOST and KALYA_SMTP.PORT configuration',
        'MAIL_CONFIG_INVALID',
        { provider: 'smtp', host: config?.host, port: config?.port }
      );
    }

    // Fail early instead of silently sending without auth.
    if (config.user && !config.password) {
      throw new InternalServerError(
        'SMTP password is missing while SMTP user is set',
        'MAIL_CONFIG_INVALID',
        { provider: 'smtp', host: config.host, port: config.port }
      );
    }

    this.config = config;

    const port = Number(config.port);
    // Env vars may arrive as strings; "false" would otherwise be truthy.
    const secure = String(config.secure) === 'true';

    interface SmtpTransportOptionsWithLookup extends SMTPTransport.Options {
      lookup?: (
        hostname: string,
        lookupOptions: unknown,
        callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void
      ) => void;
    }

    const options: SmtpTransportOptionsWithLookup = {
      host: config.host,
      port,
      secure, // true for 465 (implicit TLS), false for 587 (STARTTLS)
      requireTLS: !secure, // on 587, refuse to send without STARTTLS
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      // Force IPv4 lookup for socket connection.
      // Cloud container platforms (Render) lack outbound IPv6 routing, causing
      // 'connect ENETUNREACH' when resolving dual-stack hosts (e.g. smtp.gmail.com).
      lookup: (
        hostname: string,
        lookupOptions: unknown,
        callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void
      ) => {
        const opts =
          typeof lookupOptions === 'object' && lookupOptions !== null ? lookupOptions : {};
        dns.lookup(hostname, { ...opts, family: 4 }, callback);
      },
      auth:
        config.user && config.password
          ? {
              user: config.user,
              pass: config.password,
            }
          : undefined,
    };

    this.transporter = nodemailer.createTransport(options);
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
      const recipient = Array.isArray(options.to) ? options.to.join(', ') : options.to;

      // Gmail only allows the authenticated account as sender, so fall back to it.
      const from = options.from || this.config.email || this.config.user;
      if (!from) {
        throw new Error('No sender address configured (options.from, smtp.email or smtp.user)');
      }

      const info = await this.transporter.sendMail({
        from,
        to: recipient,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        headers: options.headers,
      });

      log.info('SMTP email dispatched successfully', {
        messageId: info.messageId,
        to: recipient,
        subject: options.subject,
      });

      return {
        messageId: info.messageId,
        success: true,
      };
    } catch (err) {
      log.error(err, {
        action: 'SMTP_SEND_FAILED',
        to: options.to,
        subject: options.subject,
        host: this.config.host,
        port: this.config.port,
      });

      throw new InternalServerError(
        err instanceof Error ? err.message : 'SMTP email delivery failed',
        'SMTP_SEND_FAILED',
        {
          to: options.to,
          subject: options.subject,
          host: this.config.host,
          port: this.config.port,
        },
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
      log.error(err, {
        action: 'SMTP_VERIFY_FAILED',
        host: this.config.host,
        port: this.config.port,
      });

      throw new ServiceUnavailableError(
        'SMTP server connection or authentication verification failed',
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
