/**
 * Kalya Cloudflare Worker — Gmail SMTP Bridge
 *
 * Runs on Cloudflare Workers (100% Free, 100k requests/day).
 * Connects directly to smtp.gmail.com:465 via raw TCP/TLS sockets (cloudflare:sockets).
 * Allows backends on Render Free tier to send emails via Gmail with ZERO timeouts.
 */

import { connect } from 'cloudflare:sockets';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health check endpoint
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      return new Response(JSON.stringify({ status: 'ok', service: 'kalya-gmail-bridge' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method !== 'POST' || url.pathname !== '/send') {
      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Optional Bearer token validation
    const authHeader = request.headers.get('Authorization');
    const secret = env.BRIDGE_SECRET || 'kalya-secret-bridge-key';
    if (authHeader && authHeader.replace(/^Bearer\s+/i, '').trim() !== secret) {
      // If client supplied auth but it didn't match secret, reject
      if (env.BRIDGE_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    try {
      const body = await request.json();
      const { smtp, message } = body;

      if (!smtp || !smtp.user || !smtp.password) {
        return new Response(
          JSON.stringify({ error: 'Missing SMTP credentials (user, password)' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!message || !message.to || !message.subject) {
        return new Response(JSON.stringify({ error: 'Missing message parameters (to, subject)' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const result = await sendSmtpEmail(smtp, message);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: err instanceof Error ? err.message : String(err),
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};

/**
 * Connects to smtp.gmail.com:465 using Cloudflare's raw socket API and transmits the email.
 */
async function sendSmtpEmail(smtpConfig, message) {
  const host = smtpConfig.host || 'smtp.gmail.com';
  const port = Number(smtpConfig.port) || 465;
  const user = smtpConfig.user.trim();
  const password = smtpConfig.password.trim().replace(/\s+/g, '');

  // Connect to Google SMTPS (Port 465 with implicit TLS)
  const socket = connect({ hostname: host, port }, { secureTransport: 'on', allowHalfOpen: false });

  const client = new SmtpSocketClient(socket);

  try {
    // 1. Initial Greeting
    const greeting = await client.readResponse();
    if (greeting.code !== 220) {
      throw new Error(`Invalid greeting: ${greeting.full}`);
    }

    // 2. EHLO handshake
    const ehlo = await client.sendCommand('EHLO localhost');
    if (ehlo.code !== 250) {
      throw new Error(`EHLO failed: ${ehlo.full}`);
    }

    // 3. AUTH LOGIN
    const authStart = await client.sendCommand('AUTH LOGIN');
    if (authStart.code !== 334) {
      throw new Error(`AUTH LOGIN initiation failed: ${authStart.full}`);
    }

    // Send base64 username
    const userResp = await client.sendCommand(btoa(user));
    if (userResp.code !== 334) {
      throw new Error(`Username rejected: ${userResp.full}`);
    }

    // Send base64 password
    const passResp = await client.sendCommand(btoa(password));
    if (passResp.code !== 235) {
      throw new Error(`Password rejected: ${passResp.full}`);
    }

    // 4. MAIL FROM
    const fromAddress = user;
    const mailFrom = await client.sendCommand(`MAIL FROM:<${fromAddress}>`);
    if (mailFrom.code !== 250) {
      throw new Error(`MAIL FROM failed: ${mailFrom.full}`);
    }

    // 5. RCPT TO
    const recipients = Array.isArray(message.to)
      ? message.to
      : message.to
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    for (const recipient of recipients) {
      const rcptTo = await client.sendCommand(`RCPT TO:<${recipient}>`);
      if (rcptTo.code !== 250 && rcptTo.code !== 251) {
        throw new Error(`RCPT TO for ${recipient} failed: ${rcptTo.full}`);
      }
    }

    // 6. DATA
    const dataStart = await client.sendCommand('DATA');
    if (dataStart.code !== 354) {
      throw new Error(`DATA start rejected: ${dataStart.full}`);
    }

    // 7. Transmit MIME Payload
    const { mime, messageId } = buildMime(message, fromAddress, recipients);
    await client.sendRaw(mime + '\r\n.\r\n');

    const dataDone = await client.readResponse();
    if (dataDone.code !== 250) {
      throw new Error(`DATA end rejected: ${dataDone.full}`);
    }

    // 8. QUIT
    await client.sendCommand('QUIT').catch(() => {});

    return {
      success: true,
      messageId,
      detail: dataDone.full,
    };
  } finally {
    await client.close();
  }
}

/**
 * Socket reader & writer helper for SMTP protocols
 */
class SmtpSocketClient {
  constructor(socket) {
    this.socket = socket;
    this.reader = socket.readable.getReader();
    this.writer = socket.writable.getWriter();
    this.decoder = new TextDecoder();
    this.encoder = new TextEncoder();
    this.buffer = '';
  }

  async readLine() {
    while (!this.buffer.includes('\r\n')) {
      const { value, done } = await this.reader.read();
      if (done) break;
      this.buffer += this.decoder.decode(value, { stream: true });
    }
    const idx = this.buffer.indexOf('\r\n');
    if (idx === -1) {
      const line = this.buffer;
      this.buffer = '';
      return line;
    }
    const line = this.buffer.slice(0, idx);
    this.buffer = this.buffer.slice(idx + 2);
    return line;
  }

  async readResponse() {
    const lines = [];
    while (true) {
      const line = await this.readLine();
      lines.push(line);
      // Last line in SMTP multi-line response format: 3 digits + space
      if (line.length >= 4 && line[3] === ' ') {
        break;
      }
    }
    const code = parseInt(lines[0].slice(0, 3), 10);
    return { code, lines, full: lines.join('\n') };
  }

  async sendCommand(cmd) {
    await this.writer.write(this.encoder.encode(cmd + '\r\n'));
    return await this.readResponse();
  }

  async sendRaw(data) {
    await this.writer.write(this.encoder.encode(data));
  }

  async close() {
    try {
      await this.writer.close();
    } catch (_) {}
    try {
      this.reader.releaseLock();
    } catch (_) {}
    try {
      await this.socket.close();
    } catch (_) {}
  }
}

/**
 * Encodes string to UTF-8 Base64 safe for email headers & bodies
 */
function toBase64Utf8(str) {
  return btoa(unescape(encodeURIComponent(str || '')));
}

/**
 * Constructs standard RFC 2822 MIME message
 */
function buildMime(message, fromUser, recipients) {
  const boundary = '----=_Part_' + Math.random().toString(36).substring(2) + '_' + Date.now();
  const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@gmail.com>`;
  const toHeader = recipients.join(', ');
  const senderHeader = message.from || `Kalya <${fromUser}>`;

  const headers = [
    `From: ${senderHeader}`,
    `To: ${toHeader}`,
    `Subject: =?UTF-8?B?${toBase64Utf8(message.subject)}?=`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${messageId}`,
    `MIME-Version: 1.0`,
  ];

  if (message.replyTo) {
    headers.push(`Reply-To: ${message.replyTo}`);
  }

  if (message.html) {
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    let body = `--${boundary}\r\n`;
    body += `Content-Type: text/plain; charset=UTF-8\r\n`;
    body += `Content-Transfer-Encoding: base64\r\n\r\n`;
    body += `${toBase64Utf8(message.text || '')}\r\n\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Type: text/html; charset=UTF-8\r\n`;
    body += `Content-Transfer-Encoding: base64\r\n\r\n`;
    body += `${toBase64Utf8(message.html)}\r\n\r\n`;
    body += `--${boundary}--\r\n`;

    return {
      mime: headers.join('\r\n') + '\r\n\r\n' + body,
      messageId,
    };
  } else {
    headers.push(`Content-Type: text/plain; charset=UTF-8`);
    headers.push(`Content-Transfer-Encoding: base64`);
    return {
      mime: headers.join('\r\n') + '\r\n\r\n' + toBase64Utf8(message.text || ''),
      messageId,
    };
  }
}
