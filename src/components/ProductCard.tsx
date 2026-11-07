import Image from 'next/image';
import Link from 'next/link';
import { categoryName } from '@/lib/catalog';
import { percentOff } from '@/lib/money';
import type { Product } from '@/lib/types';
import Price from './Price';
import QuickAdd from './QuickAdd';
import Stars from './Stars';
import WishlistButton from './WishlistButton';

export default function ProductCard({ product: p, priority = false }: { product: Product; priority?: boolean }) {
  const href = `/product/${p.slug}`;
  const off = p.variations.length ? null : percentOff(p.price, p.regularPrice);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-card transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink/5">
      <div className="relative aspect-square bg-gradient-to-b from-sage-50 to-white">
        <Link href={href} tabIndex={-1} aria-hidden>
          {p.images[0] && (
            <Image src={p.images[0]} alt={p.imageAlt} fill sizes="(min-width:1280px) 300px, (min-width:768px) 33vw, 50vw" className="object-contain p-5 transition duration-500 group-hover:scale-105" priority={priority} />
          )}
        </Link>
        {off && <span className="absolute left-3 top-3 rounded-full bg-sale px-2.5 py-1 text-xs font-bold text-white">-{off}%</span>}
        {!p.inStock && <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">Sold out</span>}
        <WishlistButton slug={p.slug} name={p.name} className="absolute right-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium text-muted">{categoryName(p.categories[0])}</p>
        <h3 className="font-display text-[15px] font-semibold leading-snug">
          <Link href={href} className="line-clamp-2 after:absolute after:inset-0 after:content-['']">{p.name}</Link>
        </h3>
        {p.rating ? <Stars rating={p.rating} count={p.reviewCount} /> : null}
        <div className="mt-auto pt-1"><Price product={p} /></div>
        <div className="relative z-10 pt-1">
          <QuickAdd variable={p.variations.length > 0} href={href} name={p.name}
            line={{ slug: p.slug, variationId: null, name: p.name, option: null, image: p.images[0] ?? '', unitPrice: p.price }} />
        </div>
      </div>
    </article>
  );
}
