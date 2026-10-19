import nodemailer, { type Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { AppConfig, MailProvider, SendMailOptions, SendMailResult } from '@kalya/types';
import { InternalServerError, ServiceUnavailableError } from '@/errors';
import { log } from '@/logger';

type SmtpTransporter = Transporter<SMTPTransport.SentMessageInfo>;

const CONNECTION_TIMEOUT_MS = 10_000;
const GREETING_TIMEOUT_MS = 10_000;
const SOCKET_TIMEOUT_MS = 15_000;
const RETRY_DELAY_MS = 1_500;
const MAX_SEND_ATTEMPTS = 2;

/** Connection-level failures worth retrying. Auth errors (EAUTH) are not included. */
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
 * SMTP mail provider (Nodemailer).
 *
 * Connects directly to the SMTP host FQDN with TLS/STARTTLS support and resilience
 * against cloud platform socket timeouts and container lifecycle pauses.
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

  private get isBridge(): boolean {
    const bridgeUrl = process.env.CLOUDFLARE_MAIL_BRIDGE_URL || process.env.KALYA_SMTP_BRIDGE_URL;
    return (
      Boolean(bridgeUrl) ||
      this.config.host.startsWith('http://') ||
      this.config.host.startsWith('https://')
    );
  }

  private get bridgeUrl(): string {
    return (
      process.env.CLOUDFLARE_MAIL_BRIDGE_URL ||
      process.env.KALYA_SMTP_BRIDGE_URL ||
      this.config.host
    ).replace(/\/+$/, '');
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
    const isPort465 = Number(port) === 465;
    const isSecure = String(secure) === 'true' || isPort465;
    const trimmedHost = host.trim();
    const isLocalDevSmtp =
      trimmedHost === 'maildev' ||
      trimmedHost === 'localhost' ||
      trimmedHost === '127.0.0.1' ||
      Number(port) === 1025;

    return nodemailer.createTransport({
      host: trimmedHost,
      port: Number(port),
      secure: isSecure,
      ignoreTLS: isLocalDevSmtp,
      requireTLS: !isSecure && !isLocalDevSmtp,
      auth:
        user && password
          ? {
              user: user.trim(),
              pass: password.trim().replace(/\s+/g, ''),
            }
          : undefined,
      connectionTimeout: CONNECTION_TIMEOUT_MS,
      greetingTimeout: GREETING_TIMEOUT_MS,
      socketTimeout: SOCKET_TIMEOUT_MS,
      tls: {
        rejectUnauthorized: !isLocalDevSmtp,
        minVersion: 'TLSv1.2',
      },
      pool: false,
    } as SMTPTransport.Options);
  }

  /**
   * Drops the transporter that failed and rotates to the next IP.
   * No-op if another caller already replaced it, so concurrent failures rotate only once.
   */
  private reset(failed: Promise<SmtpTransporter>): void {
    if (this.transporterPromise !== failed) return;
    this.transporterPromise = undefined;
    void failed.then((t) => t.close()).catch(() => undefined);
  }

  async send(options: SendMailOptions): Promise<SendMailResult> {
    if (this.isBridge) {
      return this.sendViaBridge(options);
    }

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
          log.warn('Transient SMTP error, retrying with fresh connection', {
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

  private async sendViaBridge(options: SendMailOptions): Promise<SendMailResult> {
    const url = `${this.bridgeUrl}/send`;
    const fromAddress = this.config.user;
    const sender =
      options.from && options.from.includes(fromAddress) ? options.from : `Kalya <${fromAddress}>`;

    const payload = {
      smtp: {
        host: 'smtp.gmail.com',
        port: 465,
        user: this.config.user,
        password: this.config.password.trim().replace(/\s+/g, ''),
      },
      message: {
        from: sender,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      },
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CLOUDFLARE_BRIDGE_SECRET || 'kalya-secret-bridge-key'}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        log.error('Cloudflare SMTP bridge returned error', {
          action: 'SMTP_BRIDGE_ERROR',
          status: res.status,
          error: errorText,
          to: options.to,
        });
        throw new InternalServerError(
          `Cloudflare Gmail bridge rejected: ${errorText}`,
          'SMTP_BRIDGE_FAILED',
          { to: options.to, status: res.status }
        );
      }

      const data = (await res.json()) as { messageId?: string; success?: boolean };
      log.info('Email sent via Cloudflare Gmail bridge', {
        action: 'SMTP_BRIDGE_SENT',
        messageId: data.messageId,
        to: options.to,
      });

      return {
        messageId: data.messageId || `cf_${Date.now()}`,
        success: true,
      };
    } catch (err) {
      if (err instanceof InternalServerError) throw err;
      log.error(err, { action: 'SMTP_BRIDGE_EXCEPTION', to: options.to });
      throw new InternalServerError(
        errorMessage(err),
        'SMTP_BRIDGE_EXCEPTION',
        { to: options.to, subject: options.subject },
        err
      );
    }
  }

  /** Verifies connectivity and auth through the active transport or bridge. */
  async verify(): Promise<boolean> {
    if (this.isBridge) {
      try {
        const res = await fetch(`${this.bridgeUrl}/health`, { method: 'GET' });
        return res.ok;
      } catch (err) {
        throw new ServiceUnavailableError(
          'Cloudflare SMTP bridge is unreachable',
          'SMTP_BRIDGE_UNAVAILABLE',
          { bridgeUrl: this.bridgeUrl },
          err
        );
      }
    }

    const pending = this.getTransporter();

    try {
      await (await pending).verify();
      return true;
    } catch (err) {
      this.reset(pending);
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
    if (this.isBridge) {
      log.info('Cloudflare Gmail bridge configured', {
        action: 'SMTP_BRIDGE_WARM_UP_OK',
        bridgeUrl: this.bridgeUrl,
      });
      return;
    }

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
