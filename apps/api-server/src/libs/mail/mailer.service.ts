import { BadRequestError, InternalServerError } from '@/errors';
import { log } from '@/logger';
import { createElement, render } from '@kalya/email';
import { env } from '@kalya/env';
import { MailProvider, RenderEmailOptions, SendMailOptions, SendMailResult } from '@kalya/types';

/**
 * Central Mailer Service orchestrating template rendering and provider dispatch.
 */
export class MailerService {
  constructor(
    private readonly provider: MailProvider,
    private readonly defaultFrom: string = env.mail.from
  ) {}

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
   * Renders a React-Email component to HTML and plaintext, then sends it via the provider.
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
   * Sends a pre-rendered or raw email directly via the provider.
   */
  async sendRaw(options: SendMailOptions): Promise<SendMailResult> {
    this.validateBaseOptions(options.to, options.subject);

    return await this.provider.send({
      ...options,
      from: options.from || this.defaultFrom || env.mail.from,
    });
  }

  get providerName(): string {
    return this.provider.name;
  }

  async verify(): Promise<boolean> {
    return await this.provider.verify();
  }

  /** Closes the provider transport if it supports cleanup. */
  close(): void {
    const p = this.provider as { close?: () => void };
    if (typeof p.close === 'function') p.close();
  }

  /** Primes the provider connection check at startup. No-op if unsupported. */
  warmUp(): void {
    const p = this.provider as { warmUp?: () => void };
    if (typeof p.warmUp === 'function') p.warmUp();
  }
}
