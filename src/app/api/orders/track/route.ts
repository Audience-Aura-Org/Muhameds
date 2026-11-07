import { NextResponse } from 'next/server';
import { z } from 'zod';
import { findOrderByEmail, paymentLabel, STATUS_LABEL } from '@/lib/orders';
import { rateLimit } from '@/lib/rate-limit';

const input = z.object({ number: z.string().trim().min(3).max(40), email: z.string().trim().email().max(200) });

export async function POST(req: Request) {
  if (!(await rateLimit('track', 20, 10 * 60_000))) return NextResponse.json({ error: 'Too many lookups. Please try again later.' }, { status: 429 });
  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter your order number and the email used at checkout.' }, { status: 400 });
  const o = await findOrderByEmail(parsed.data.number, parsed.data.email);
  if (!o) return NextResponse.json({ error: 'Sorry, the order could not be found. Please contact us if you are having difficulty finding your order details.' }, { status: 404 });
  return NextResponse.json({
    number: o.number, createdAt: o.createdAt, status: STATUS_LABEL[o.status], payment: paymentLabel(o.paymentMethod),
    lines: o.lines.map((l) => ({ name: l.name, option: l.option, qty: l.qty, lineTotal: l.lineTotal })), totals: o.totals,
  });
}
