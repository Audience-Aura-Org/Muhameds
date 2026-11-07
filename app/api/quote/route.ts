import { NextResponse } from 'next/server';
import { quote, quoteInput } from '@/lib/orders';

export async function POST(req: Request) {
  const parsed = quoteInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid cart' }, { status: 400 });
  return NextResponse.json(await quote(parsed.data));
}
