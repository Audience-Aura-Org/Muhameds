import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, priorityCount = 0, columns = 4 }: { products: Product[]; priorityCount?: number; columns?: 3 | 4 }) {
  const cols = columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-3 xl:grid-cols-4';
  return (
    <ul className={`grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 ${cols}`}>
      {products.map((p, i) => (
        <li key={p.slug} className="flex">
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
