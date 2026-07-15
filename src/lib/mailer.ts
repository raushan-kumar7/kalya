import nodemailer from "nodemailer";
import { Resend } from "resend";
import { ReactElement } from "react";
import { render } from "react-email";

const FROM_ADDRESS = process.env.MAIL_FROM ?? "Kalya <noreply@kalya.io>";

export type SendMailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type SendMailResult = {
  provider: string;
  id?: string;
};

/**
 * Every provider implements this one shape. Swapping providers means
 * writing a function like this and pointing MAIL_PROVIDER at it —
 * sendMail() and every call site stay untouched.
 */
type MailProvider = (input: SendMailInput) => Promise<SendMailResult>;

/* ============================================================
   PROVIDER: SMTP (Nodemailer)
   Works for local dev (Mailpit/Maildev on localhost:1025) AND
   for any provider that exposes SMTP credentials — Postmark,
   Amazon SES, Mailgun, SendGrid, or Resend's own SMTP endpoint.
   Switching to one of those is just changing SMTP_* env vars.
   ============================================================ */
const smtpTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

const smtpProvider: MailProvider = async ({ to, subject, html, text, replyTo }) => {
  const info = await smtpTransport.sendMail({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
    text,
    replyTo,
  });
  return { provider: "smtp", id: info.messageId };
};

/* ============================================================
   PROVIDER: Resend
   Only instantiated if selected — no API key needed otherwise.
   ============================================================ */
const resendProvider: MailProvider = async ({ to, subject, html, text, replyTo }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
    text,
    replyTo,
  });

  if (error) {
    throw new Error(`Resend failed to send email: ${error.message}`);
  }
  return { provider: "resend", id: data?.id };
};

/* ============================================================
   PROVIDER SELECTION
   MAIL_PROVIDER controls this independently of NODE_ENV, so
   "prod" and "which provider" aren't the same decision. Default
   assumes local dev (SMTP) unless explicitly told otherwise.

   To drop Resend entirely: delete resendProvider + the "resend"
   dependency, remove its case below, and set MAIL_PROVIDER=smtp
   with real SMTP credentials in prod. Nothing else in the app
   needs to change, since every call site only ever calls sendMail().
   ============================================================ */
const providers: Record<string, MailProvider> = {
  smtp: smtpProvider,
  resend: resendProvider,
};

const selectedProvider = process.env.MAIL_PROVIDER ?? "smtp";

const getProvider = (): MailProvider => {
  const provider = providers[selectedProvider];
  if (!provider) {
    throw new Error(
      `Unknown MAIL_PROVIDER "${selectedProvider}". Available: ${Object.keys(providers).join(", ")}`,
    );
  }
  return provider;
};

/* ============================================================
   PUBLIC API — this is the only thing the rest of the app calls.
   ============================================================ */
export const sendMail = async ({
  to,
  subject,
  react,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
}): Promise<SendMailResult> => {
  const html = await render(react);
  const text = await render(react, { plainText: true });

  try {
    return await getProvider()({ to, subject, html, text, replyTo });
  } catch (err) {
    console.error(`[mailer:${selectedProvider}] Failed to send "${subject}" to ${to}:`, err);
    throw err;
  }
};