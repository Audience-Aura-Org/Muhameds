import type { Metadata } from 'next';
import { products } from '@/lib/catalog';
import WishlistView, { type LiteProduct } from './WishlistView';

export const metadata: Metadata = { title: 'Wishlist', robots: { index: false } };

export default function WishlistPage() {
  const catalog: LiteProduct[] = products.map((p) => ({ slug: p.slug, name: p.name, price: p.price, regularPrice: p.regularPrice, image: p.images[0] ?? '', variable: p.variations.length > 0, inStock: p.inStock }));
  return (
    <div className="container-x max-w-4xl pt-8 sm:pt-12">
      <h1 className="h-display mb-6 text-center text-[34px] sm:mb-10 sm:text-left leading-[1.05] sm:text-[56px]">Wishlist</h1>
      <WishlistView catalog={catalog} />
    </div>
  );
}
