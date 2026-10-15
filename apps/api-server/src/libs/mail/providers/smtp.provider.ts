import dns from 'node:dns/promises';
import nodemailer, { type Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { AppConfig, MailProvider, SendMailOptions, SendMailResult } from '@kalya/types';
import { InternalServerError, ServiceUnavailableError } from '@/errors';
import { log } from '@/logger';

type SmtpTransporter = Transporter<SMTPTransport.SentMessageInfo>;

const CONNECTION_TIMEOUT_MS = 10_000;
const GREETING_TIMEOUT_MS = 10_000;
const SOCKET_TIMEOUT_MS = 20_000;
const POOL_MAX_CONNECTIONS = 3;
const POOL_MAX_MESSAGES = 50;
const RETRY_DELAY_MS = 2_000;
const MAX_SEND_ATTEMPTS = 2;

const TRANSIENT_PATTERNS = [
  'timeout',
  'econnreset',
  'econnrefused',
  'etimedout',
  'connection closed',
  'socket closed',
];

/**
 * SMTP mail provider (Nodemailer).
 *
 * Resolves the SMTP host to an IPv4 address before connecting, because platforms
 * like Render have no outbound IPv6 (otherwise: `connect ENETUNREACH 2607:f8b0:...`).
 * TLS certificate validation still runs against the real hostname.
 */
export class SmtpMailProvider implements MailProvider {
  readonly name = 'smtp';
  private transporterPromise?: Promise<SmtpTransporter>;

  constructor(private readonly config: AppConfig['smtp']) {
    const { host, port, user, password } = config ?? {};

    if (!host || !port || !user || !password) {
      throw new InternalServerError(
        'SMTP config requires host, port, user and password',
        'MAIL_CONFIG_INVALID',
        { provider: 'smtp', host, port }
      );
    }
  }

  /** Builds a transporter that connects to the IPv4 address of the SMTP host. */
  private async buildTransport(pool: boolean): Promise<SmtpTransporter> {
    const { host, port, user, password, secure } = this.config;
    const isSecure = String(secure) === 'true'; // true -> 465, false -> 587 (STARTTLS)

    const { address } = await dns.lookup(host, { family: 4 });

    return nodemailer.createTransport({
      host: address, // IPv4 literal
      port: Number(port),
      secure: isSecure,
      requireTLS: !isSecure,
      auth: { user, pass: password },
      connectionTimeout: CONNECTION_TIMEOUT_MS,
      greetingTimeout: GREETING_TIMEOUT_MS,
      socketTimeout: SOCKET_TIMEOUT_MS,
      tls: { servername: host, rejectUnauthorized: true },
      ...(pool && {
        pool: true,
        maxConnections: POOL_MAX_CONNECTIONS,
        maxMessages: POOL_MAX_MESSAGES,
      }),
    } as SMTPTransport.Options);
  }

  /** Lazily creates the pooled transporter; clears the cache if creation fails. */
  private getTransporter(): Promise<SmtpTransporter> {
    this.transporterPromise ??= this.buildTransport(true).catch((err) => {
      this.transporterPromise = undefined;
      throw err;
    });
    return this.transporterPromise;
  }

  async send(options: SendMailOptions): Promise<SendMailResult> {
    for (let attempt = 1; ; attempt++) {
      try {
        const transporter = await this.getTransporter();
        const info = await transporter.sendMail({
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
        if (attempt < MAX_SEND_ATTEMPTS && this.isTransientError(err)) {
          log.warn('Transient SMTP error, retrying', {
            action: 'SMTP_SEND_RETRY',
            to: options.to,
            attempt,
            error: err instanceof Error ? err.message : String(err),
          });
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          continue;
        }

        log.error(err, { action: 'SMTP_SEND_FAILED', to: options.to, subject: options.subject });
        throw new InternalServerError(
          err instanceof Error ? err.message : 'SMTP email delivery failed',
          'SMTP_SEND_FAILED',
          { to: options.to, subject: options.subject },
          err
        );
      }
    }
  }

  async verify(): Promise<boolean> {
    let probe: SmtpTransporter | undefined;
    try {
      probe = await this.buildTransport(false); // one-off, not pooled
      await probe.verify();
      return true;
    } catch (err) {
      log.error(err, { action: 'SMTP_VERIFY_FAILED' });
      throw new ServiceUnavailableError(
        'SMTP connection or authentication failed',
        'SMTP_CONNECTION_FAILED',
        { host: this.config.host, port: this.config.port },
        err
      );
    } finally {
      probe?.close();
    }
  }

  /** Fire-and-forget startup check. Never throws. */
  warmUp(): void {
    this.verify()
      .then(() => log.info('SMTP warm-up OK', { action: 'SMTP_WARM_UP_OK' }))
      .catch((err) =>
        log.warn('SMTP warm-up failed (non-fatal)', {
          action: 'SMTP_WARM_UP_FAILED',
          error: err instanceof Error ? err.message : String(err),
        })
      );
  }

  close(): void {
    void this.transporterPromise?.then((t) => t.close()).catch(() => undefined);
  }

  private isTransientError(err: unknown): boolean {
    if (!(err instanceof Error)) return false;
    const msg = err.message.toLowerCase();
    return TRANSIENT_PATTERNS.some((p) => msg.includes(p));
  }
}
