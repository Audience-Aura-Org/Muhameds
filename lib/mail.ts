import 'server-only';
import nodemailer from 'nodemailer';

/**
 * Sends mail via SMTP when SMTP_HOST is configured; otherwise logs to the server
 * console so local development and tests work without credentials.
 */
let transport: nodemailer.Transporter | null = null;
function getTransport() {
  if (!process.env.SMTP_HOST) return null;
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
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
    await t.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, ...msg });
  } catch (e) {
    // Never fail an order because email is down; the order is already stored.
    console.error('[mail] send failed', e);
  }
}

export const storeInbox = () => process.env.STORE_EMAIL || 'info@muhamedstore.com';
