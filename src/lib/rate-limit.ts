import 'server-only';
import { headers } from 'next/headers';

const hits = new Map<string, number[]>();

/** Simple sliding-window limiter per client IP (per server instance). */
export async function rateLimit(bucket: string, limit: number, windowMs: number): Promise<boolean> {
  const h = await headers();
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || 'local';
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) { hits.set(key, recent); return false; }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) hits.clear(); // bound memory
  return true;
}
