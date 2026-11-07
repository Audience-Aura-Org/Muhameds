'use client';
import Image from 'next/image';
import Link from 'next/link';
import { cartActions, useWishlist, wishlistActions } from '@/lib/client-store';
import { formatMoney } from '@/lib/money';
import { IconTrash } from '@/components/Icons';

export type LiteProduct = { slug: string; name: string; price: number; regularPrice: number | null; image: string; variable: boolean; inStock: boolean };

export default function WishlistView({ catalog }: { catalog: LiteProduct[] }) {
  const { slugs } = useWishlist();
  const items = slugs.map((s) => catalog.find((p) => p.slug === s)).filter((p): p is LiteProduct => !!p);
  if (!items.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-line bg-white p-12 text-center">
        <p className="h-display text-2xl">This wishlist is empty.</p>
        <p className="mt-2 text-muted">You don&apos;t have any products in the wishlist yet. Tap the heart on any product to save it here.</p>
        <Link href="/shop" className="btn btn-primary mt-6">Return to shop</Link>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-line rounded-[2rem] border border-line bg-white">
      {items.map((p) => (
        <li key={p.slug} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
          <Link href={`/product/${p.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-sage-50">
            {p.image && <Image src={p.image} alt="" fill sizes="80px" className="object-contain p-2" />}
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/product/${p.slug}`} className="font-semibold hover:underline">{p.name}</Link>
            <p className="text-sm text-muted">{p.variable ? `From ${formatMoney(p.price)}` : formatMoney(p.price)}</p>
          </div>
          {p.variable ? <Link href={`/product/${p.slug}`} className="btn btn-ghost py-2.5">Select options</Link> : (
            <button className="btn btn-primary py-2.5" disabled={!p.inStock}
              onClick={() => { cartActions.add({ slug: p.slug, variationId: null, qty: 1, name: p.name, option: null, image: p.image, unitPrice: p.price }); wishlistActions.remove(p.slug); }}>
              Move to cart
            </button>
          )}
          <button className="rounded-full p-2 text-muted hover:bg-sale/10 hover:text-sale" onClick={() => wishlistActions.remove(p.slug)} aria-label={`Remove ${p.name} from wishlist`}><IconTrash width={18} /></button>
        </li>
      ))}
    </ul>
  );
}
