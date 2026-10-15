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
const MAX_VERIFY_ADDRESSES = 3;

/** Connection-level failures where trying again (on another IP) can help. Auth errors are NOT here. */
const TRANSIENT_CODES = new Set([
  'ETIMEDOUT',
  'ECONNECTION',
  'ESOCKET',
  'ECONNRESET',
  'ECONNREFUSED',
  'ENETUNREACH',
  'EHOSTUNREACH',
  'EAI_AGAIN',
  'EDNS',
]);

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
 * Resolves the SMTP host to IPv4 addresses itself (platforms like Render have no
 * outbound IPv6) and connects to an IPv4 literal. TLS certificate validation still
 * runs against the real hostname via `tls.servername`.
 *
 * On connection-level failures the transporter is discarded, DNS is re-resolved,
 * and the next IPv4 address is used.
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

  /** All IPv4 addresses for the SMTP host (fresh lookup each time). */
  private async resolveAddresses(): Promise<string[]> {
    const { host } = this.config;
    const records = await dns.lookup(host, { family: 4, all: true });
    const addresses = [...new Set(records.map((r) => r.address))];

    if (addresses.length === 0) {
      throw new Error(`No IPv4 address found for SMTP host "${host}"`);
    }
    return addresses;
  }

  private createTransport(address: string, pool: boolean): SmtpTransporter {
    const { host, port, user, password, secure } = this.config;
    const isSecure = String(secure) === 'true'; // true -> 465 (implicit TLS), false -> 587 (STARTTLS)

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
    this.transporterPromise ??= (async () => {
      const addresses = await this.resolveAddresses();
      const address = addresses[this.addressOffset % addresses.length];
      return this.createTransport(address, true);
    })().catch((err) => {
      this.transporterPromise = undefined;
      throw err;
    });
    return this.transporterPromise;
  }

  /** Drops the pooled transporter and rotates to the next IP on the next build. */
  private resetTransporter(): void {
    const previous = this.transporterPromise;
    this.transporterPromise = undefined;
    this.addressOffset += 1;
    void previous?.then((t) => t.close()).catch(() => undefined);
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
          log.warn('Transient SMTP error, retrying on next address', {
            action: 'SMTP_SEND_RETRY',
            to: options.to,
            attempt,
            error: err instanceof Error ? err.message : String(err),
          });
          this.resetTransporter();
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

  /** Verifies connectivity + auth, trying each resolved IPv4 address until one works. */
  async verify(): Promise<boolean> {
    let lastError: unknown;

    try {
      const addresses = (await this.resolveAddresses()).slice(0, MAX_VERIFY_ADDRESSES);

      for (const address of addresses) {
        const probe = this.createTransport(address, false); // one-off, not pooled
        try {
          await probe.verify();
          return true;
        } catch (err) {
          lastError = err;
          log.warn('SMTP verify failed for address', {
            action: 'SMTP_VERIFY_ADDRESS_FAILED',
            address,
            error: err instanceof Error ? err.message : String(err),
          });
        } finally {
          probe.close();
        }
      }
    } catch (err) {
      lastError = err; // DNS failure
    }

    throw new ServiceUnavailableError(
      'SMTP connection or authentication failed',
      'SMTP_CONNECTION_FAILED',
      { host: this.config.host, port: this.config.port },
      lastError
    );
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
    const previous = this.transporterPromise;
    this.transporterPromise = undefined;
    void previous?.then((t) => t.close()).catch(() => undefined);
  }

  private isTransientError(err: unknown): boolean {
    if (!(err instanceof Error)) return false;

    const code = (err as NodeJS.ErrnoException).code;
    if (code && TRANSIENT_CODES.has(code)) return true;

    const msg = err.message.toLowerCase();
    return TRANSIENT_PATTERNS.some((p) => msg.includes(p));
  }
}
