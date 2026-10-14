export type ComponentType<P = any> = (props: P) => any;

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

export interface SendMailResult {
  messageId: string;
  success: boolean;
}

export interface MailProvider {
  readonly name: string;
  send(options: SendMailOptions): Promise<SendMailResult>;
  verify(): Promise<boolean>;
}

export interface RenderEmailOptions<P> {
  template: ComponentType<P>;
  props: P;
  to: string | string[];
  subject: string;
  from?: string;
}
