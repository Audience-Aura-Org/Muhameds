import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, priorityCount = 0 }: { products: Product[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => <li key={p.slug} className="flex"><ProductCard product={p} priority={i < priorityCount} /></li>)}
    </ul>
  );
}
