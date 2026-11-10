import type { MetadataRoute } from 'next';
import { categories, pages, products, visibleCategories } from '@/lib/catalog';
import { abs } from '@/lib/seo';

// Regenerated on every build, so lastModified = deploy date.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const indexable = new Set(visibleCategories().map((c) => c.slug));
  return [
    { url: abs('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: abs('/shop'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ...categories
      .filter((c) => indexable.has(c.slug))
      .map((c) => ({ url: abs(`/product-category/${c.slug}`), lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...products.map((p) => ({
      url: abs(`/product/${p.slug}`), lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7,
      images: p.images.slice(0, 3).map(abs),
    })),
    ...pages.map((p) => ({ url: abs(`/${p.slug}`), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.4 })),
  ];
}
