import type { Review } from '@/lib/types';
import Stars from './Stars';

// UTC so server-rendered and client-fetched reviews show the same date
const fmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

/** One published review. Used by the server-rendered first page and by MoreReviews. */
export default function ReviewItem({ review: r }: { review: Review }) {
  return (
    <li className="py-6 first:pt-0">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 font-semibold text-brand-700" aria-hidden>{r.author.charAt(0)}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{r.author}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Stars rating={r.rating} size={13} />
            {r.date && <time dateTime={r.date} className="text-xs text-muted">{fmt.format(new Date(r.date))}</time>}
          </div>
        </div>
      </div>
      {/* catalog review HTML, migrated from the old site at build time (not user input at runtime) */}
      <div className="rich mt-3 text-[15px] text-ink-soft" dangerouslySetInnerHTML={{ __html: r.text }} />
    </li>
  );
}
