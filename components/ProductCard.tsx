import Image from 'next/image';
import IntentLink from '@/components/IntentLink';
import { categoryName } from '@/lib/catalog';
import { percentOff } from '@/lib/money';
import type { Product } from '@/lib/types';
import Price from './Price';
import QuickAdd from './QuickAdd';
import Stars from './Stars';
import WishlistButton from './WishlistButton';

const SIZES = '(min-width:1280px) 300px, (min-width:768px) 30vw, 46vw';

export default function ProductCard({ product: p, priority = false }: { product: Product; priority?: boolean }) {
  const href = `/product/${p.slug}`;
  const variable = p.variations.length > 0;
  const off = variable ? null : percentOff(p.price, p.regularPrice);

  return (
    <article className="group relative flex w-full flex-col">
      {/* image well — see .img-well in globals.css */}
      <div className="relative aspect-square overflow-hidden rounded-2xl img-well transition-shadow duration-300 can-hover:group-hover:shadow-lift">
        {p.images[0] && (
          <Image
            src={p.images[0]}
            alt={p.imageAlt}
            fill
            sizes={SIZES}
            priority={priority}
            className="object-contain p-5 img-blend transition-transform duration-700 ease-out-soft sm:p-7 can-hover:group-hover:scale-[1.05]"
          />
        )}

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {!p.inStock && <span className="badge bg-ink text-white">Sold out</span>}
          {p.inStock && off ? <span className="badge bg-sale text-white">−{off}%</span> : null}
        </div>

        <WishlistButton slug={p.slug} name={p.name} reveal className="absolute right-3 top-3 z-10" />

        <div className="absolute bottom-3 right-3 z-10">
          <QuickAdd
            variable={variable}
            href={href}
            name={p.name}
            disabled={!p.inStock}
            line={{ slug: p.slug, variationId: null, name: p.name, option: null, image: p.images[0] ?? '', unitPrice: p.price }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted">{categoryName(p.categories[0])}</p>
          {p.rating ? <Stars rating={p.rating} count={p.reviewCount} compact /> : null}
        </div>
        <h3 className="mt-1 text-[15px] font-medium leading-snug text-ink">
          {/* stretched link: the whole card is clickable, interactive children sit above it via z-10 */}
          <IntentLink href={href} className="line-clamp-2 outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-brand-700 focus-visible:after:ring-offset-4 focus-visible:after:ring-offset-paper can-hover:group-hover:underline can-hover:group-hover:decoration-line-strong can-hover:group-hover:underline-offset-4">
            {p.name}
          </IntentLink>
        </h3>
        <Price product={p} className="mt-auto pt-2" />
      </div>
    </article>
  );
}
