'use client';
import { useState } from 'react';
import { IconStar } from './Icons';

export default function ReviewForm({ slug, productName }: { slug: string; productName: string }) {
  const [rating, setRating] = useState(0);
  const [state, setState] = useState<{ status: 'idle' | 'sending' | 'done' | 'error'; error?: string; fields?: Record<string, string> }>({ status: 'idle' });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState({ status: 'sending' });
    const res = await fetch('/api/reviews', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, rating, author: fd.get('author'), email: fd.get('email'), text: fd.get('text'), website: fd.get('website') }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (res?.ok) setState({ status: 'done' });
    else setState({ status: 'error', error: data?.error ?? 'Could not submit your review. Please try again.', fields: data?.fieldErrors });
  }

  if (state.status === 'done') {
    return <p role="status" className="rounded-2xl bg-brand-50 p-5 text-brand-700">Thank you! Your review is awaiting approval.</p>;
  }
  const err = (k: string) => state.fields?.[k];
  return (
    <form onSubmit={submit} noValidate className="space-y-4 surface p-6">
      <h3 className="font-display text-xl font-bold">Add a review</h3>
      <p className="text-sm text-muted">Reviewing {productName}. Your email address will not be published.</p>
      <fieldset>
        <legend className="label">Your rating *</legend>
        <div className="flex gap-1" role="radiogroup">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)} className="text-gold">
              <IconStar filled={n <= rating} width={28} height={28} />
            </button>
          ))}
        </div>
        {err('rating') && <p className="mt-1 text-sm text-sale">{err('rating')}</p>}
      </fieldset>
      <div>
        <label htmlFor="rv-text" className="label">Your review *</label>
        <textarea id="rv-text" name="text" rows={4} className="field" required aria-invalid={!!err('text')} />
        {err('text') && <p className="mt-1 text-sm text-sale">{err('text')}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rv-name" className="label">Name *</label>
          <input id="rv-name" name="author" className="field" required autoComplete="name" aria-invalid={!!err('author')} />
          {err('author') && <p className="mt-1 text-sm text-sale">{err('author')}</p>}
        </div>
        <div>
          <label htmlFor="rv-email" className="label">Email *</label>
          <input id="rv-email" name="email" type="email" className="field" required autoComplete="email" aria-invalid={!!err('email')} />
          {err('email') && <p className="mt-1 text-sm text-sale">{err('email')}</p>}
        </div>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.status === 'error' && <p role="alert" className="text-sm text-sale">{state.error}</p>}
      <button className="btn btn-primary" disabled={state.status === 'sending'}>{state.status === 'sending' ? 'Submitting…' : 'Submit'}</button>
    </form>
  );
}
