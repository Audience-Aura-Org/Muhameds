import IntentLink from '@/components/IntentLink';

export default function Pagination({ page, pageCount, href }: { page: number; pageCount: number; href: (p: number) => string }) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1);
  const cls = 'grid h-11 min-w-11 place-items-center rounded-full px-3 text-sm font-semibold tabular-nums transition';
  return (
    <nav aria-label="Pagination" className="mt-12 flex justify-center">
      <ul className="flex items-center gap-1.5">
        {page > 1 && <li><IntentLink className={`${cls} border border-line-strong bg-card hover:border-ink`} href={href(page - 1)} rel="prev">← <span className="sr-only">Previous</span></IntentLink></li>}
        {pages.map((p, i) => (
          <li key={p} className="flex items-center gap-1.5">
            {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-muted">…</span>}
            {p === page
              ? <span aria-current="page" className={`${cls} bg-ink text-white`}>{p}</span>
              : <IntentLink className={`${cls} border border-line-strong bg-card hover:border-ink`} href={href(p)}>{p}</IntentLink>}
          </li>
        ))}
        {page < pageCount && <li><IntentLink className={`${cls} border border-line-strong bg-card hover:border-ink`} href={href(page + 1)} rel="next"><span className="sr-only">Next</span> →</IntentLink></li>}
      </ul>
    </nav>
  );
}
