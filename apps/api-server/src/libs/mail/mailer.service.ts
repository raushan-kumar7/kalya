import { BadRequestError, InternalServerError } from '@/errors';
import { log } from '@/logger';
import { createElement, render } from '@kalya/email';
import { env } from '@kalya/env';
import { MailProvider, RenderEmailOptions, SendMailOptions, SendMailResult } from '@kalya/types';

/**
 * Central Mailer Service orchestrating template rendering and provider dispatch.
 *
 * @description Bridges @kalya/email React-Email templates with active MailProvider drivers,
 * handling parameter validation, parallel HTML/plaintext generation, and comprehensive error mapping.
 */
export class MailerService {
  constructor(
    private readonly provider: MailProvider,
    private readonly defaultFrom: string = env.mail.from
  ) {}

  /**
   * Validates mandatory email fields common across all dispatch methods.
   */
  private validateBaseOptions(to: string | string[], subject: string): void {
    if (!to || (Array.isArray(to) && to.length === 0)) {
      throw new BadRequestError(
        'Recipient email address (to) must not be empty',
        'INVALID_MAIL_RECIPIENT'
      );
    }

    if (!subject || subject.trim() === '') {
      throw new BadRequestError('Email subject is required', 'MISSING_EMAIL_SUBJECT');
    }
  }

  /**
   * Renders a React-Email component to HTML and plaintext, then transmits via the active mail provider.
   *
   * @template P - The React props interface expected by the email template component.
   * @param {RenderEmailOptions<P>} options - Email rendering options including template component, props, recipient, and subject.
   * @returns {Promise<SendMailResult>} Delivery result containing the provider messageId and success status.
   * @throws {BadRequestError} If recipient email address or template component is missing.
   * @throws {InternalServerError} If React-Email fails to render or the mail provider rejects delivery.
   */
  async sendTemplate<P extends object>(options: RenderEmailOptions<P>): Promise<SendMailResult> {
    this.validateBaseOptions(options.to, options.subject);

    if (!options.template) {
      throw new BadRequestError('Email template component is required', 'MISSING_EMAIL_TEMPLATE');
    }

    let html: string;
    let text: string | undefined;

    try {
      const element = createElement(options.template, options.props);
      html = await render(element);
      text = await render(element, { plainText: true });
    } catch (renderError) {
      log.error(renderError, {
        action: 'EMAIL_TEMPLATE_RENDER_FAILED',
        to: options.to,
        subject: options.subject,
      });

      throw new InternalServerError(
        'Failed to render React-Email template into HTML and plaintext',
        'EMAIL_RENDER_FAILED',
        { to: options.to, subject: options.subject },
        renderError
      );
    }

    return await this.provider.send({
      to: options.to,
      from: options.from || this.defaultFrom || env.mail.from,
      subject: options.subject,
      html,
      text,
    });
  }

  /**
   * Dispatches a pre-rendered or raw HTML email directly via the active mail provider.
   *
   * @param {SendMailOptions} options - Raw email parameters including recipient, subject, and HTML body.
   * @returns {Promise<SendMailResult>} Delivery result from the mail provider.
   * @throws {BadRequestError} If recipient email address or subject is empty.
   */
  async sendRaw(options: SendMailOptions): Promise<SendMailResult> {
    this.validateBaseOptions(options.to, options.subject);

    return await this.provider.send({
      ...options,
      from: options.from || this.defaultFrom || env.mail.from,
    });
  }

  /**
   * Retrieves the name of the underlying active mail provider.
   */
  get providerName(): string {
    return this.provider.name;
  }

  /**
   * Verifies connectivity and health of the active mail provider.
   *
   * @returns {Promise<boolean>} True if the underlying mail provider is verified and healthy.
   */
  async verify(): Promise<boolean> {
    return await this.provider.verify();
  }

  /**
   * Closes the underlying mail provider transport if it implements connection cleanup.
   */
  close(): void {
    if (
      'close' in this.provider &&
      typeof (this.provider as { close?: () => void }).close === 'function'
    ) {
      (this.provider as { close: () => void }).close();
    }
  }

  /**
   * Eagerly primes the underlying mail provider's connection so the first
   * real email does not pay the full TCP + TLS + SMTP handshake cost.
   *
   * @description No-op if the provider does not implement `warmUp`.
   */
  warmUp(): void {
    if (
      'warmUp' in this.provider &&
      typeof (this.provider as { warmUp?: () => void }).warmUp === 'function'
    ) {
      (this.provider as { warmUp: () => void }).warmUp();
    }
  }

  /**
   * Starts a keep-alive heartbeat on the underlying mail provider.
   *
   * @description Returns a timeout handle that should be cleared on shutdown.
   * Returns undefined if the provider does not support keep-alives.
   *
   * @returns {NodeJS.Timeout | undefined} Interval handle or undefined.
   */
  startKeepAlive(): NodeJS.Timeout | undefined {
    if (
      'startKeepAlive' in this.provider &&
      typeof (this.provider as { startKeepAlive?: () => NodeJS.Timeout }).startKeepAlive ===
        'function'
    ) {
      return (this.provider as { startKeepAlive: () => NodeJS.Timeout }).startKeepAlive();
    }
    return undefined;
  }
}
