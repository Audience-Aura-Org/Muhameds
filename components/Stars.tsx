import { IconStar } from './Icons';

type Props = { rating: number; count?: number; size?: number; compact?: boolean };

/** Star rating. `compact` renders a single star + score, for dense listings. */
export default function Stars({ rating, count, size = 14, compact = false }: Props) {
  const label = `Rated ${rating.toFixed(1)} out of 5${count != null ? `, ${count} review${count === 1 ? '' : 's'}` : ''}`;
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs tabular-nums" role="img" aria-label={label}>
        <IconStar width={12} height={12} className="text-gold" />
        <span className="font-semibold text-ink">{rating.toFixed(1)}</span>
        {count != null && <span className="text-muted">({count})</span>}
      </span>
    );
  }
  const r = Math.round(rating * 2) / 2;
  return (
    <span className="inline-flex items-center gap-1.5" role="img" aria-label={label}>
      <span className="flex gap-px text-gold">
        {[1, 2, 3, 4, 5].map((i) => <IconStar key={i} filled={i <= r} width={size} height={size} />)}
      </span>
      {count != null && <span className="text-xs tabular-nums text-muted">({count})</span>}
    </span>
  );
}
