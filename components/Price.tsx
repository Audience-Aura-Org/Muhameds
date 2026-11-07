import { formatMoney } from '@/lib/money';
import type { Product } from '@/lib/types';

export function priceRange(p: Product): [number, number] | null {
  if (!p.variations.length) return null;
  const ps = p.variations.map((v) => v.price);
  const lo = Math.min(...ps), hi = Math.max(...ps);
  return lo === hi ? null : [lo, hi];
}

/** Compact listing price. Variable products show a "From" price; sale items show the struck-through original. */
export default function Price({ product, className = '' }: { product: Product; className?: string }) {
  const range = priceRange(product);
  if (range) {
    return (
      <p className={`flex items-baseline gap-1.5 ${className}`}>
        <span className="text-xs text-muted">From</span>
        <span className="text-[15px] font-semibold tabular-nums text-ink"><span className="sr-only">lowest price </span>{formatMoney(range[0])}</span>
      </p>
    );
  }
  const onSale = product.regularPrice != null && product.regularPrice > product.price;
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className={`text-[15px] font-semibold tabular-nums ${onSale ? 'text-sale' : 'text-ink'}`}>
        {onSale && <span className="sr-only">Sale price: </span>}{formatMoney(product.price)}
      </span>
      {onSale && (
        <del className="text-[13px] tabular-nums text-muted"><span className="sr-only">Original price: </span>{formatMoney(product.regularPrice!)}</del>
      )}
    </p>
  );
}
