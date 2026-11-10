import type { Metadata } from 'next';
import { products, site } from '@/lib/catalog';
import { breadcrumbLd, isFilteredListing } from '@/lib/seo';
import Listing, { type ListingParams } from '@/components/Listing';
import JsonLd from '@/components/JsonLd';

type Props = { searchParams: Promise<ListingParams> };

const description = `Shop all ${products.length} Muha Meds products — cartridges, disposables, concentrates and more. Secure checkout, fast delivery and free shipping over $500.`;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = await searchParams;
  return {
    title: p.q ? `Search results for “${p.q}”` : 'Shop all products',
    description,
    alternates: { canonical: '/shop' },
    openGraph: { title: `Shop all products | ${site.name}`, description, url: '/shop' },
    // search, filter, sort and page-2+ URLs are near-duplicates of /shop
    ...(isFilteredListing(p) ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ShopPage({ searchParams }: Props) {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }])} />
      <Listing basePath="/shop" title="Shop" params={await searchParams} />
    </>
  );
}
