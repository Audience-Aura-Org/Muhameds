'use client';
import { useWishlist, wishlistActions } from '@/lib/client-store';
import { IconHeart } from './Icons';

export default function WishlistButton({ slug, name, className = '' }: { slug: string; name: string; className?: string }) {
  const on = useWishlist().slugs.includes(slug);
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); wishlistActions.toggle(slug); }}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      className={`grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-sm transition hover:scale-105 ${on ? 'text-sale' : 'text-ink'} ${className}`}
    >
      <IconHeart filled={on} width={19} height={19} />
    </button>
  );
}
