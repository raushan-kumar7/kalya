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
const MAX_SEND_ATTEMPTS = 3;

/** Connection-level failures worth retrying on another IP. Auth errors (EAUTH) are not included. */
const TRANSIENT_CODES = new Set([
  'ETIMEDOUT',
  'ECONNECTION',
  'ESOCKET',
  'ECONNRESET',
  'ECONNREFUSED',
  'ENETUNREACH',
  'EHOSTUNREACH',
  'EAI_AGAIN',
]);

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * SMTP mail provider (Nodemailer, pooled).
 *
 * Connects to an IPv4 literal (some platforms have no outbound IPv6) while TLS
 * validation still runs against the real hostname. On connection-level failures
 * the transporter is dropped, DNS is re-resolved, and the next IP is used.
 */
export class SmtpMailProvider implements MailProvider {
  readonly name = 'smtp';
  private transporterPromise?: Promise<SmtpTransporter>;
  private addressOffset = 0;

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

  /** Lazily builds the pooled transporter; clears the cache if building fails. */
  private getTransporter(): Promise<SmtpTransporter> {
    this.transporterPromise ??= this.buildTransporter().catch((err) => {
      this.transporterPromise = undefined;
      throw err;
    });
    return this.transporterPromise;
  }

  private async buildTransporter(): Promise<SmtpTransporter> {
    const { host, port, user, password, secure } = this.config;
    const isSecure = String(secure) === 'true'; // true -> 465 (implicit TLS), false -> 587 (STARTTLS)

    const records = await dns.lookup(host, { family: 4, all: true });
    if (records.length === 0) throw new Error(`No IPv4 address found for "${host}"`);
    const { address } = records[this.addressOffset % records.length];

    return nodemailer.createTransport({
      host: address,
      port: Number(port),
      secure: isSecure,
      requireTLS: !isSecure,
      auth: { user, pass: password },
      connectionTimeout: CONNECTION_TIMEOUT_MS,
      greetingTimeout: GREETING_TIMEOUT_MS,
      socketTimeout: SOCKET_TIMEOUT_MS,
      tls: { servername: host, rejectUnauthorized: true },
      pool: true,
      maxConnections: POOL_MAX_CONNECTIONS,
      maxMessages: POOL_MAX_MESSAGES,
    } as SMTPTransport.Options);
  }

  /**
   * Drops the transporter that failed and rotates to the next IP.
   * No-op if another caller already replaced it, so concurrent failures rotate only once.
   */
  private reset(failed: Promise<SmtpTransporter>): void {
    if (this.transporterPromise !== failed) return;
    this.transporterPromise = undefined;
    this.addressOffset += 1;
    void failed.then((t) => t.close()).catch(() => undefined);
  }

  async send(options: SendMailOptions): Promise<SendMailResult> {
    for (let attempt = 1; ; attempt++) {
      const pending = this.getTransporter();

      try {
        const transporter = await pending;
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
        if (attempt < MAX_SEND_ATTEMPTS && this.isTransient(err)) {
          log.warn('Transient SMTP error, retrying on next address', {
            action: 'SMTP_SEND_RETRY',
            to: options.to,
            attempt,
            error: errorMessage(err),
          });
          this.reset(pending);
          await sleep(RETRY_DELAY_MS);
          continue;
        }

        log.error(err, { action: 'SMTP_SEND_FAILED', to: options.to, subject: options.subject });
        throw new InternalServerError(
          errorMessage(err),
          'SMTP_SEND_FAILED',
          { to: options.to, subject: options.subject },
          err
        );
      }
    }
  }

  /** Verifies connectivity and auth through the same pooled transporter used for sending. */
  async verify(): Promise<boolean> {
    const pending = this.getTransporter();

    try {
      await (await pending).verify();
      return true;
    } catch (err) {
      if (this.isTransient(err)) this.reset(pending);
      throw new ServiceUnavailableError(
        'SMTP connection or authentication failed',
        'SMTP_CONNECTION_FAILED',
        { host: this.config.host, port: this.config.port },
        err
      );
    }
  }

  /** Fire-and-forget startup check. Never throws. */
  warmUp(): void {
    this.verify()
      .then(() => log.info('SMTP warm-up OK', { action: 'SMTP_WARM_UP_OK' }))
      .catch((err) =>
        log.warn('SMTP warm-up failed (non-fatal)', {
          action: 'SMTP_WARM_UP_FAILED',
          error: errorMessage(err.cause ?? err),
        })
      );
  }

  close(): void {
    const pending = this.transporterPromise;
    this.transporterPromise = undefined;
    void pending?.then((t) => t.close()).catch(() => undefined);
  }

  private isTransient(err: unknown): boolean {
    const code = (err as NodeJS.ErrnoException | undefined)?.code;
    return code !== undefined && TRANSIENT_CODES.has(code);
  }
}
