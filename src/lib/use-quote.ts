'use client';
import { useEffect, useState } from 'react';
import { cartActions } from './client-store';
import type { PricedLine, Totals } from './pricing';
import type { CartLine } from './types';

export interface Quote { lines: PricedLine[]; totals: Totals; issues: string[]; couponMessage: string | null }

/** Server-authoritative totals for the current cart (debounced). */
export function useQuote(lines: CartLine[], coupon: string, email = '') {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const key = JSON.stringify([lines.map((l) => [l.slug, l.variationId, l.qty]), coupon, email]);
  useEffect(() => {
    if (!lines.length) { setQuote(null); return; }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/quote', {
          method: 'POST', headers: { 'content-type': 'application/json' }, signal: ctrl.signal,
          body: JSON.stringify({ lines: lines.map(({ slug, variationId, qty }) => ({ slug, variationId, qty })), coupon, email }),
        });
        if (res.ok) {
          const q = (await res.json()) as Quote;
          setQuote(q);
          cartActions.reprice(q.lines);
        }
      } catch { /* aborted or offline: keep previous quote */ } finally { if (!ctrl.signal.aborted) setLoading(false); }
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { quote, loading };
}
