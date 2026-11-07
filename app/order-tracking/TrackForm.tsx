'use client';
import { useState } from 'react';
import { formatMoney } from '@/lib/money';

type Result = { number: string; createdAt: string; status: string; payment: string; lines: { name: string; option: string | null; qty: number; lineTotal: number }[]; totals: { total: number } };

export default function TrackForm() {
  const [res, setRes] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true); setError(''); setRes(null);
    try {
      const r = await fetch('/api/orders/track', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ number: fd.get('number'), email: fd.get('email') }) });
      const data = await r.json().catch(() => ({}));
      if (r.ok) setRes(data); else setError(data.error ?? 'Lookup failed.');
    } catch { setError('Network error. Please try again.'); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-4 surface p-6 sm:p-8">
        <p className="text-ink-soft">To track your order please enter your Order ID and the email you used during checkout. Both are in your confirmation email.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="t-number" className="label">Order ID</label><input id="t-number" name="number" required placeholder="MM-251106-1234" className="field" /></div>
          <div><label htmlFor="t-email" className="label">Billing email</label><input id="t-email" name="email" type="email" required autoComplete="email" placeholder="Email you used during checkout" className="field" /></div>
        </div>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Looking up…' : 'Track'}</button>
        {error && <p role="alert" className="text-sm text-sale">{error}</p>}
      </form>
      {res && (
        <section aria-live="polite" className="surface p-6 sm:p-8">
          <h2 className="h-display text-[26px]">Order {res.number}</h2>
          <p className="mt-2 text-ink-soft">Placed on {new Date(res.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })} · Payment: {res.payment}</p>
          <p className="mt-4 inline-block rounded-full bg-brand-50 px-4 py-2 font-semibold text-brand-700">{res.status}</p>
          <ul className="mt-6 divide-y divide-line">
            {res.lines.map((l, i) => <li key={i} className="flex justify-between py-3 text-[15px]"><span>{l.name}{l.option && ` · ${l.option}`} × {l.qty}</span><span className="font-semibold">{formatMoney(l.lineTotal)}</span></li>)}
          </ul>
          <p className="mt-3 text-right text-lg font-semibold">Total {formatMoney(res.totals.total)}</p>
        </section>
      )}
    </div>
  );
}
