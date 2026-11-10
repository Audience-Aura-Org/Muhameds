import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categories, getCategory, getProduct, site } from '@/lib/catalog';
import { abs, breadcrumbLd, describe, isFilteredListing, seoTitle } from '@/lib/seo';
import Listing, { type ListingParams } from '@/components/Listing';
import JsonLd from '@/components/JsonLd';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<ListingParams> };

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

const categoryDescription = (c: NonNullable<ReturnType<typeof getCategory>>) =>
  describe(c.seo.description, c.description, `Shop ${c.products.length} ${c.name} products at ${site.name}. Free shipping on orders over $500.`);

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const c = getCategory((await params).slug);
  if (!c) return {};
  const title = seoTitle(c.seo.title, c.name);
  const description = categoryDescription(c);
  const image = getProduct(c.products[0])?.images[0];
  return {
    title, description,
    alternates: { canonical: `/product-category/${c.slug}` },
    openGraph: { title, description, url: `/product-category/${c.slug}`, ...(image ? { images: [{ url: image, alt: c.name }] } : {}) },
    ...(isFilteredListing(await searchParams) ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const c = getCategory((await params).slug);
  if (!c) notFound();
  const path = `/product-category/${c.slug}`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.name, url: abs(path), description: categoryDescription(c),
    mainEntity: {
      '@type': 'ItemList', numberOfItems: c.products.length,
      itemListElement: c.products.slice(0, 30).map((slug, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/product/${slug}`) })),
    },
  };
  return (
    <>
      <JsonLd data={[ld, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }, { name: c.name, path }])]} />
      <Listing basePath={path} title={c.name} intro={c.description} category={c.slug} params={await searchParams} />
    </>
  );
}
