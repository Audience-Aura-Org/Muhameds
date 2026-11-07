import { NextResponse } from 'next/server';
import { z } from 'zod';
import { append } from '@/lib/store';
import { sendMail, storeInbox } from '@/lib/mail';
import { rateLimit } from '@/lib/rate-limit';

const input = z.object({
  name: z.string().trim().min(1, 'Required').max(100),
  email: z.string().trim().email('Enter a valid email address').max(200),
  subject: z.string().trim().max(200).optional().default(''),
  message: z.string().trim().min(5, 'Please write a message').max(5000),
  website: z.string().max(0).optional().default(''), // honeypot
});

export async function POST(req: Request) {
  const tooMany = () => NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 });
  if (!(await rateLimit('contact-attempt', 30, 10 * 60_000))) return tooMany();
  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[i.path.join('.')] ??= i.message;
    return NextResponse.json({ error: 'Please check the highlighted fields.', fieldErrors }, { status: 400 });
  }
  if (!(await rateLimit('contact', 5, 10 * 60_000))) return tooMany();
  const m = parsed.data;
  await append('messages', { ...m, website: undefined, createdAt: new Date().toISOString() });
  await sendMail({ to: storeInbox(), replyTo: m.email, subject: `Contact form: ${m.subject || m.name}`, text: `${m.name} <${m.email}>\n\n${m.message}` });
  return NextResponse.json({ ok: true });
}
