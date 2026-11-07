import 'server-only';
import nodemailer from 'nodemailer';

/**
 * Outgoing mail over SMTP (configured for Titan Mail — see README "Email").
 *
 * - Without SMTP_HOST + SMTP_PASS, mail is logged to the server console instead, so local
 *   development works without credentials.
 * - Titan only accepts mail whose From address is the authenticated mailbox, so the From
 *   address is always SMTP_USER; MAIL_FROM only supplies the display name.
 * - Short timeouts: checkout waits for these sends, so a slow mail server must not stall it.
 */

const TITAN_DEFAULTS = { host: 'smtp.titan.email', port: 465 };

export function mailConfig() {
  const host = process.env.SMTP_HOST?.trim() || '';
  const port = Number(process.env.SMTP_PORT || TITAN_DEFAULTS.port);
  const user = process.env.SMTP_USER?.trim() || '';
  const pass = process.env.SMTP_PASS || '';
  // 465 = implicit TLS; 587 = STARTTLS. Explicit SMTP_SECURE overrides.
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  // MAIL_FROM may be `Name` or `Name <address>`; only the name is used
  const name = (process.env.MAIL_FROM ?? '').split('<')[0].replace(/"/g, '').trim() || 'Muha Meds Store';
  return { host, port, secure, user, pass, from: user ? { name, address: user } : undefined, enabled: Boolean(host && user && pass) };
}

let transport: nodemailer.Transporter | null = null;
let warned = false;

function getTransport() {
  const c = mailConfig();
  if (!c.enabled) {
    if (c.host && !warned) {
      warned = true;
      console.warn('[mail] SMTP_HOST is set but SMTP_USER/SMTP_PASS are missing — emails will only be logged.');
    }
    return null;
  }
  transport ??= nodemailer.createTransport({
    host: c.host,
    port: c.port,
    secure: c.secure,
    requireTLS: !c.secure, // never send credentials in clear text on 587
    auth: { user: c.user, pass: c.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transport;
}

export async function sendMail(msg: { to: string; subject: string; text: string; replyTo?: string }) {
  const t = getTransport();
  if (!t) {
    console.info(`[mail:dev] to=${msg.to} subject="${msg.subject}"\n${msg.text}`);
    return;
  }
  try {
    await t.sendMail({ from: mailConfig().from, ...msg });
  } catch (e) {
    // Never fail an order because email is down; the order is already stored.
    console.error('[mail] send failed', e);
  }
}

export const storeInbox = () => process.env.STORE_EMAIL || 'info@muhamedstore.com';
