import 'server-only';
import productsJson from '@/data/products.json';
import categoriesJson from '@/data/categories.json';
import pagesJson from '@/data/pages.json';
import siteJson from '@/data/site.json';
import type { Category, Page, Product, Site } from './types';

export const products = productsJson as unknown as Product[];
export const categories = categoriesJson as unknown as Category[];
export const pages = pagesJson as unknown as Page[];
export const site = siteJson as unknown as Site;

const bySlug = new Map(products.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return bySlug.get(slug);
}

export function getProducts(slugs: string[]): Product[] {
  return slugs.map((s) => bySlug.get(s)).filter((p): p is Product => !!p);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getPage(slug: string): Page | undefined {
  return pages.find((p) => p.slug === slug);
}

/** Categories shown in navigation/filters (skip the WordPress default bucket). */
export function visibleCategories(): Category[] {
  return categories.filter((c) => c.slug !== 'uncategorized' && c.products.length > 0);
}

export const SORTS = {
  default: 'Default sorting',
  popularity: 'Sort by popularity',
  rating: 'Sort by average rating',
  'price-asc': 'Sort by price: low to high',
  'price-desc': 'Sort by price: high to low',
} as const;
export type SortKey = keyof typeof SORTS;

export interface ListQuery {
  q?: string;
  category?: string;
  sort?: string;
  min?: number; // dollars
  max?: number;
  page?: number;
  perPage?: number;
}

const strip = (html: string) => html.replace(/<[^>]+>/g, ' ');
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim();

export function listProducts(query: ListQuery) {
  let list = products;
  if (query.category) {
    const cat = getCategory(query.category);
    list = cat ? list.filter((p) => cat.products.includes(p.slug)) : [];
  }
  if (query.q) {
    const terms = norm(query.q).split(' ').filter(Boolean);
    list = list.filter((p) => {
      const hay = norm(`${p.name} ${strip(p.shortDescription)} ${p.categories.join(' ')}`);
      // match singular/plural loosely ("pre-roll" ~ "pre-rolls")
      return terms.every((t) => hay.includes(t.replace(/s$/, '')));
    });
  }
  if (query.min != null) list = list.filter((p) => p.price >= query.min! * 100);
  if (query.max != null) list = list.filter((p) => p.price <= query.max! * 100);

  const sort = (query.sort && query.sort in SORTS ? query.sort : 'default') as SortKey;
  if (sort !== 'default') {
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return (b.rating ?? 0) - (a.rating ?? 0) || b.reviewCount - a.reviewCount;
        case 'popularity': return b.reviewCount - a.reviewCount;
      }
    });
  }

  const perPage = query.perPage ?? 12;
  const total = list.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, query.page ?? 1), pageCount);
  return { items: list.slice((page - 1) * perPage, page * perPage), total, page, pageCount, sort };
}

export function priceBounds() {
  const prices = products.map((p) => p.price / 100);
  return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
}

export function relatedProducts(product: Product, limit = 8): Product[] {
  const same = products.filter((p) => p.slug !== product.slug && p.categories.some((c) => product.categories.includes(c)));
  // deterministic rotation so each product shows a different neighbourhood
  const start = same.length ? product.id % same.length : 0;
  return [...same.slice(start), ...same.slice(0, start)].slice(0, limit);
}

export function categoryName(slug: string): string {
  return getCategory(slug)?.name ?? slug;
}
