import { IconStar } from './Icons';

export default function Stars({ rating, count, size = 14 }: { rating: number; count?: number; size?: number }) {
  const r = Math.round(rating * 2) / 2;
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Rated ${rating.toFixed(2)} out of 5${count != null ? `, ${count} reviews` : ''}`} role="img">
      <span className="flex text-gold">
        {[1, 2, 3, 4, 5].map((i) => <IconStar key={i} filled={i <= r} width={size} height={size} />)}
      </span>
      {count != null && <span className="text-xs text-muted">({count})</span>}
    </span>
  );
}
