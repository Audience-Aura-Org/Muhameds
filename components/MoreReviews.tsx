'use client';
import { useState } from 'react';
import type { Review } from '@/lib/types';
import ReviewItem from './ReviewItem';

/** Loads the reviews after the first server-rendered page, on request. */
export default function MoreReviews({ slug, offset, total }: { slug: string; offset: number; total: number }) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');

  async function load() {
    setState('loading');
    try {
      const res = await fetch(`/api/reviews?slug=${encodeURIComponent(slug)}&offset=${offset}`);
      if (!res.ok) throw new Error(String(res.status));
      setReviews(((await res.json()) as { reviews: Review[] }).reviews);
      setState('idle');
    } catch {
      setState('error');
    }
  }

  if (reviews) {
    return (
      <ol className="divide-y divide-line border-t border-line" start={offset + 1} aria-label={`Reviews ${offset + 1} to ${total}`}>
        {reviews.map((r, i) => <ReviewItem key={i} review={r} />)}
      </ol>
    );
  }

  return (
    <div className="border-t border-line pt-6">
      <button type="button" className="btn btn-ghost w-full" onClick={load} disabled={state === 'loading'} aria-busy={state === 'loading'}>
        {state === 'loading' ? 'Loading reviews…' : `Show all ${total} reviews`}
      </button>
      {state === 'error' && <p role="alert" className="mt-3 text-center text-sm text-sale">Couldn&apos;t load reviews. Please try again.</p>}
    </div>
  );
}
