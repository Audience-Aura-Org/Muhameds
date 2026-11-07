import type { Metadata } from 'next';
import Listing, { type ListingParams } from '@/components/Listing';

export const metadata: Metadata = { title: 'Shop', alternates: { canonical: '/shop' } };

export default async function ShopPage({ searchParams }: { searchParams: Promise<ListingParams> }) {
  return <Listing basePath="/shop" title="Shop" params={await searchParams} />;
}
