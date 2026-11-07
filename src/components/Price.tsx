import { formatMoney } from '@/lib/money';
import type { Product } from '@/lib/types';

export function priceRange(p: Product): [number, number] | null {
  if (!p.variations.length) return null;
  const ps = p.variations.map((v) => v.price);
  const lo = Math.min(...ps), hi = Math.max(...ps);
  return lo === hi ? null : [lo, hi];
}

export default function Price({ product, size = 'sm' }: { product: Product; size?: 'sm' | 'lg' }) {
  const range = priceRange(product);
  const cls = size === 'lg' ? 'text-2xl' : 'text-base';
  if (range) {
    return <p className={`${cls} font-semibold text-ink`}><span className="sr-only">Price range: </span>{formatMoney(range[0])} – {formatMoney(range[1])}</p>;
  }
  const onSale = product.regularPrice && product.regularPrice > product.price;
  return (
    <p className={`${cls} flex flex-wrap items-baseline gap-2 font-semibold`}>
      {onSale && <del className="text-[0.85em] font-normal text-muted"><span className="sr-only">Original price was: </span>{formatMoney(product.regularPrice!)}</del>}
      <span className={onSale ? 'text-sale' : 'text-ink'}>{onSale && <span className="sr-only">Current price is: </span>}{formatMoney(product.price)}</span>
    </p>
  );
}
