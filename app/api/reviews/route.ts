import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getProduct } from '@/lib/catalog';
import { append } from '@/lib/store';
import { rateLimit } from '@/lib/rate-limit';

const input = z.object({
  slug: z.string().min(1).max(200),
  rating: z.number().int().min(1, 'Please select a rating').max(5),
  author: z.string().trim().min(1, 'Required').max(80),
  email: z.string().trim().email('Enter a valid email address').max(200),
  text: z.string().trim().min(10, 'Please write at least a few words').max(3000),
  website: z.string().max(0).optional().default(''), // honeypot
});

/** Published reviews past the first page. The product page server-renders the first few and
 *  fetches the rest on demand, so long review lists don't bloat every product page's HTML. */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const product = getProduct(sp.get('slug') ?? '');
  if (!product) return NextResponse.json({ error: 'Unknown product' }, { status: 404 });
  const offset = Math.max(0, Math.min(Number(sp.get('offset')) || 0, product.reviews.length));
  return NextResponse.json(
    { reviews: product.reviews.slice(offset) },
    // catalog reviews only change on deploy
    { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' } },
  );
}

/** Reviews are stored for moderation and never published automatically.
 *  Links are rejected outright: the old site's spam reviews were all link drops. */
export async function POST(req: Request) {
  const tooMany = () => NextResponse.json({ error: 'Too many reviews. Please try again later.' }, { status: 429 });
  if (!(await rateLimit('review-attempt', 30, 10 * 60_000))) return tooMany();
  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[i.path.join('.')] ??= i.message;
    return NextResponse.json({ error: 'Please check the highlighted fields.', fieldErrors }, { status: 400 });
  }
  const r = parsed.data;
  if (!getProduct(r.slug)) return NextResponse.json({ error: 'Unknown product' }, { status: 404 });
  if (/https?:\/\/|www\.|\[url|<a\s/i.test(r.text)) return NextResponse.json({ error: 'Links are not allowed in reviews.', fieldErrors: { text: 'Links are not allowed in reviews.' } }, { status: 400 });
  if (!(await rateLimit('review', 3, 10 * 60_000))) return tooMany();
  await append('reviews-pending', { ...r, website: undefined, createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
