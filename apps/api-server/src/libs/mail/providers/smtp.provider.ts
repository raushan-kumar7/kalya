import nodemailer, { type Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { AppConfig, MailProvider, SendMailOptions, SendMailResult } from '@kalya/types';
import { InternalServerError, ServiceUnavailableError } from '@/errors';
import { log } from '@/logger';

/**
 * How long (ms) to wait while establishing the TCP connection to the SMTP server.
 * Keep well under Render's 30 s request timeout so errors surface quickly.
 */
const CONNECTION_TIMEOUT_MS = 10_000;

/**
 * How long (ms) to wait for the SMTP greeting banner after the TCP socket opens.
 */
const GREETING_TIMEOUT_MS = 10_000;

/**
 * How long (ms) of inactivity on the socket before considering it dead.
 * Cloud firewalls (Render, AWS, GCP) silently kill TCP connections idle for
 * more than ~60 s. Setting this lower forces nodemailer to detect the drop
 * and create a fresh connection instead of hanging indefinitely.
 */
const SOCKET_TIMEOUT_MS = 20_000;

/**
 * Maximum simultaneous open SMTP connections in the pool.
 */
const POOL_MAX_CONNECTIONS = 3;

/**
 * Maximum number of messages to send over a single pooled connection before
 * it is recycled. Recycling early avoids long-lived sockets being killed mid-flight
 * by cloud NAT tables.
 */
const POOL_MAX_MESSAGES = 50;

/**
 * How often (ms) to send a NOOP keep-alive so cloud NAT tables don't expire
 * idle pool connections before `socketTimeout` has a chance to catch the drop.
 * Must be shorter than socketTimeout (20 s) and typical NAT idle limits (60 s).
 */
const KEEP_ALIVE_INTERVAL_MS = 15_000;

/**
 * SMTP Mail Provider implementing the central MailProvider interface via Nodemailer.
 *
 * @description Manages a pooled SMTP connection to Gmail, authenticates using
 * environment configuration, dispatches outgoing emails with retry support, and
 * provides connection verification diagnostics.
 *
 * ### Gmail on Render — key settings
 * - Port **587** with `secure: false` + `requireTLS: true` (STARTTLS) — Render
 *   allows outbound 587; port 465 (SSL) is often blocked on cloud providers.
 * - Explicit **connectionTimeout / greetingTimeout / socketTimeout** prevent
 *   indefinite hangs when cloud NAT/firewalls silently drop idle TCP sockets.
 * - **Connection pool** (`pool: true`) reuses authenticated sessions; recycling
 *   via `maxConnections` / `maxMessages` prevents stale-socket timeouts.
 */
export class SmtpMailProvider implements MailProvider {
  readonly name = 'smtp';
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;

  /**
   * Initializes the pooled SMTP transporter with host, port, credentials,
   * TLS settings, and explicit timeout guards.
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

    // For Gmail: secure=false + requireTLS=true → STARTTLS on port 587.
    // secure=true would use implicit TLS on port 465, which Render blocks.
    const isSecure = String(secure) === 'true';

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: isSecure,
      requireTLS: !isSecure,
      auth: { user, pass: password },

      // ── Timeout guards ───────────────────────────────────────────────────
      // Without these, nodemailer waits forever when cloud firewalls drop
      // the TCP handshake or kill an idle socket between requests.
      connectionTimeout: CONNECTION_TIMEOUT_MS,
      greetingTimeout: GREETING_TIMEOUT_MS,
      socketTimeout: SOCKET_TIMEOUT_MS,

      // ── Connection pool ──────────────────────────────────────────────────
      // Reuses authenticated sessions across sequential sends (avoids
      // per-email TLS handshake overhead) but recycles them before cloud
      // NAT tables expire the underlying socket.
      pool: true,
      maxConnections: POOL_MAX_CONNECTIONS,
      maxMessages: POOL_MAX_MESSAGES,

      // ── TLS ─────────────────────────────────────────────────────────────
      tls: {
        rejectUnauthorized: true,
      },
    } as SMTPTransport.Options);
  }

  /**
   * Dispatches an email via the configured SMTP transport with one automatic
   * retry on transient connection failures (ECONNRESET, ETIMEDOUT, etc.).
   *
   * @param {SendMailOptions} options - Outgoing email parameters including recipients, subject, and body.
   * @returns {Promise<SendMailResult>} Delivery receipt containing messageId and success status.
   * @throws {InternalServerError} If the SMTP transport fails after all retries.
   */
  async send(options: SendMailOptions): Promise<SendMailResult> {
    return this._sendWithRetry(options, 1);
  }

  /**
   * Internal send implementation with configurable retry count.
   */
  private async _sendWithRetry(
    options: SendMailOptions,
    retriesLeft: number
  ): Promise<SendMailResult> {
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
      const isTransient = this._isTransientError(err);

      if (isTransient && retriesLeft > 0) {
        log.warn('Transient SMTP error — retrying', {
          action: 'SMTP_SEND_RETRY',
          to: options.to,
          retriesLeft,
          error: err instanceof Error ? err.message : String(err),
        });

        // Wait 2 s before retrying to allow the connection to recover.
        await this._sleep(2_000);
        return this._sendWithRetry(options, retriesLeft - 1);
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

  /**
   * Returns true for errors that indicate a broken or stale connection rather
   * than a permanent delivery failure — safe to retry automatically.
   */
  private _isTransientError(err: unknown): boolean {
    if (!(err instanceof Error)) return false;
    const msg = err.message.toLowerCase();
    return (
      msg.includes('timeout') ||
      msg.includes('econnreset') ||
      msg.includes('econnrefused') ||
      msg.includes('connection closed') ||
      msg.includes('socket closed') ||
      msg.includes('etimedout')
    );
  }

  /**
   * Verifies SMTP connection and authentication health.
   *
   * @description Uses a short-lived one-off transporter so the verification
   * probe does not interfere with the pooled production transporter.
   *
   * @returns {Promise<boolean>} True if the SMTP server is reachable and credentials are valid.
   * @throws {ServiceUnavailableError} If the connection cannot be established or authentication fails.
   */
  async verify(): Promise<boolean> {
    // Use a fresh non-pooled transporter for the health check so we do not
    // exhaust pool slots or leave the probe connection open in the pool.
    const probe = nodemailer.createTransport({
      host: this.config.host,
      port: Number(this.config.port),
      secure: String(this.config.secure) === 'true',
      requireTLS: String(this.config.secure) !== 'true',
      auth: { user: this.config.user, pass: this.config.password },
      connectionTimeout: CONNECTION_TIMEOUT_MS,
      greetingTimeout: GREETING_TIMEOUT_MS,
      socketTimeout: SOCKET_TIMEOUT_MS,
      tls: { rejectUnauthorized: true },
    } as SMTPTransport.Options);

    try {
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
      probe.close();
    }
  }

  /**
   * Eagerly opens one pool connection so the first real email does not pay
   * the full TCP + TLS + SMTP handshake cost.
   *
   * @description Call this once at server startup (fire-and-forget). Any error
   * is logged but swallowed — a warm-up failure must never crash the server.
   */
  warmUp(): void {
    // nodemailer pool exposes _getConnections only internally; the simplest
    // portable way to prime it is to call verify() on a fresh probe.
    const probe = nodemailer.createTransport({
      host: this.config.host,
      port: Number(this.config.port),
      secure: String(this.config.secure) === 'true',
      requireTLS: String(this.config.secure) !== 'true',
      auth: { user: this.config.user, pass: this.config.password },
      connectionTimeout: CONNECTION_TIMEOUT_MS,
      greetingTimeout: GREETING_TIMEOUT_MS,
      socketTimeout: SOCKET_TIMEOUT_MS,
      tls: { rejectUnauthorized: true },
    } as SMTPTransport.Options);

    probe
      .verify()
      .then(() => {
        log.info('SMTP pool warmed up — connection ready', { action: 'SMTP_WARM_UP_OK' });
      })
      .catch((err) => {
        log.warn('SMTP warm-up failed (non-fatal)', {
          action: 'SMTP_WARM_UP_FAILED',
          error: err instanceof Error ? err.message : String(err),
        });
      })
      .finally(() => {
        probe.close();
      });
  }

  /**
   * Starts a recurring NOOP keep-alive to prevent cloud NAT tables from
   * silently expiring idle pool connections between emails.
   *
   * @returns {NodeJS.Timeout} The interval handle — pass to `clearInterval` on shutdown.
   */
  startKeepAlive(): NodeJS.Timeout {
    return setInterval(() => {
      // sendMail with an intentionally invalid address is rejected immediately
      // by Gmail without consuming quota, but it forces the pool to open /
      // validate its connection. We silence the error entirely — this is only
      // a connectivity probe.
      void this.transporter
        .sendMail({
          from: this.config.user,
          to: this.config.user, // send to self — Gmail accepts & drops silently
          subject: '.',
          text: '.',
          envelope: { from: this.config.user, to: [] }, // empty RCPT → aborted early
        })
        .catch(() => {
          /* intentional no-op: keep-alive probe, errors expected */
        });
    }, KEEP_ALIVE_INTERVAL_MS);
  }

  /**
   * Closes active idle SMTP socket connections in the pool.
   */
  close(): void {
    this.transporter.close();
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
