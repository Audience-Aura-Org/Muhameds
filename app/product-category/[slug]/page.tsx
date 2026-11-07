import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categories, getCategory } from '@/lib/catalog';
import Listing, { type ListingParams } from '@/components/Listing';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<ListingParams> };

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCategory((await params).slug);
  if (!c) return {};
  return { title: c.seo.title.split(' - ')[0] || c.name, description: c.seo.description || undefined, alternates: { canonical: `/product-category/${c.slug}` } };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const c = getCategory((await params).slug);
  if (!c) notFound();
  return <Listing basePath={`/product-category/${c.slug}`} title={c.name} intro={c.description} category={c.slug} params={await searchParams} />;
}
