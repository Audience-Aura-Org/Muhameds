// Verifies the SMTP settings in .env.local (Titan Mail) and sends one test email.
//   npm run mail:test                 -> sends to STORE_EMAIL
//   npm run mail:test -- you@example.com
import nextEnv from '@next/env';
import nodemailer from 'nodemailer';

nextEnv.loadEnvConfig(process.cwd());

const host = process.env.SMTP_HOST?.trim() || 'smtp.titan.email';
const port = Number(process.env.SMTP_PORT || 465);
const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
const user = process.env.SMTP_USER?.trim();
const pass = process.env.SMTP_PASS;
const to = process.argv[2] || process.env.STORE_EMAIL || user;

if (!user || !pass) {
  console.error('✗ Set SMTP_USER and SMTP_PASS in .env.local first (the Titan mailbox address and its password).');
  process.exit(1);
}

const t = nodemailer.createTransport({ host, port, secure, requireTLS: !secure, auth: { user, pass }, connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000 });

try {
  console.log(`→ Connecting to ${host}:${port} (${secure ? 'SSL/TLS' : 'STARTTLS'}) as ${user} …`);
  await t.verify();
  console.log('✓ Login OK');
  const info = await t.sendMail({ from: { name: 'Muha Meds Store', address: user }, to, subject: 'Muha Meds Store — test email', text: `SMTP is working.\n\nSent from ${host}:${port} at ${new Date().toISOString()}.` });
  console.log(`✓ Test email sent to ${to} (${info.messageId})`);
} catch (e) {
  console.error('✗ Failed:', e.message);
  if (/auth|535|credentials/i.test(e.message)) console.error('  Check SMTP_USER is the full mailbox address and SMTP_PASS is that mailbox\'s password.');
  if (/timeout|ECONNREFUSED|ENOTFOUND/i.test(e.message)) console.error('  The host may block outbound SMTP. Try SMTP_PORT=587 with SMTP_SECURE=false.');
  process.exit(1);
}
