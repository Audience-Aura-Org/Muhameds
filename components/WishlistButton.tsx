'use client';
import { useWishlist, wishlistActions } from '@/lib/client-store';
import { IconHeart } from './Icons';

type Props = {
  slug: string;
  name: string;
  className?: string;
  /** Hide until the parent `.group` is hovered/focused (mouse devices only). Always shown once saved. */
  reveal?: boolean;
};

export default function WishlistButton({ slug, name, className = '', reveal = false }: Props) {
  const on = useWishlist().slugs.includes(slug);
  const revealCls = reveal && !on
    ? 'can-hover:opacity-0 can-hover:group-hover:opacity-100 can-hover:group-focus-within:opacity-100 focus-visible:opacity-100'
    : '';
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); wishlistActions.toggle(slug); }}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      className={`grid h-10 w-10 place-items-center rounded-full bg-card shadow-soft sm:h-9 sm:w-9 transition duration-200 hover:scale-105 active:scale-95 ${on ? 'text-sale' : 'text-ink hover:text-sale'} ${revealCls} ${className}`}
    >
      <IconHeart filled={on} width={17} height={17} />
    </button>
  );
}
