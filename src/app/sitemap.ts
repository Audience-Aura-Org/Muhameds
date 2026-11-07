import type { MetadataRoute } from 'next';
import { categories, pages, products } from '@/lib/catalog';
import { SITE_URL } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/shop`, priority: 0.9 },
    ...categories.filter((c) => c.slug !== 'uncategorized').map((c) => ({ url: `${SITE_URL}/product-category/${c.slug}`, priority: 0.8 })),
    ...products.map((p) => ({ url: `${SITE_URL}/product/${p.slug}`, priority: 0.7 })),
    ...pages.map((p) => ({ url: `${SITE_URL}/${p.slug}`, priority: 0.4 })),
  ];
}
