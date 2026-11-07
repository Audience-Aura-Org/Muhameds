import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { categoryName, getProduct, products, relatedProducts, site } from '@/lib/catalog';
import { SITE_URL } from '@/lib/site-url';
import ProductBuyBox from '@/components/ProductBuyBox';
import ProductCard from '@/components/ProductCard';
import ProductRail from '@/components/ProductRail';
import ReviewForm from '@/components/ReviewForm';
import MoreReviews from '@/components/MoreReviews';
import ReviewItem from '@/components/ReviewItem';
import Stars from '@/components/Stars';
import { IconArrowRight, IconChevronDown } from '@/components/Icons';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const metaDescription = (html: string) => { const t = text(html); return t.length > 158 ? t.slice(0, 155).replace(/\s\S*$/, '') + '…' : t; };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  const description = metaDescription(p.shortDescription || p.description);
  return {
    title: p.name, description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { title: p.name, description, images: p.images.slice(0, 1), type: 'website' },
  };
}

export default async function ProductPage({ params }: Props) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const related = relatedProducts(p);
  const cat = p.categories[0];
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.sku,
    image: p.images.map((i) => SITE_URL + i), description: metaDescription(p.shortDescription || p.description),
    offers: p.variations.length
      ? { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: (Math.min(...p.variations.map((v) => v.price)) / 100).toFixed(2), highPrice: (Math.max(...p.variations.map((v) => v.price)) / 100).toFixed(2), offerCount: p.variations.length, availability: 'https://schema.org/InStock' }
      : { '@type': 'Offer', priceCurrency: 'USD', price: (p.price / 100).toFixed(2), availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: `${SITE_URL}/product/${p.slug}` },
    ...(p.reviews.length ? {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: (p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(2), reviewCount: p.reviews.length },
    } : {}),
  };
  const avg = p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : null;

  const trust = site.home.services.slice(0, 3);
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: p.reviews.filter((r) => Math.round(r.rating) === n).length }));

  return (
    <div className="container-x pt-5 sm:pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted sm:mb-8">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="transition hover:text-ink">Home</Link></li><li aria-hidden className="text-line-strong">/</li>
          <li><Link href={`/product-category/${cat}`} className="transition hover:text-ink">{categoryName(cat)}</Link></li><li aria-hidden className="text-line-strong">/</li>
          <li aria-current="page" className="line-clamp-1 text-ink">{p.name}</li>
        </ol>
      </nav>

      <ProductBuyBox
        product={p}
        footer={
          <div className="mt-8 space-y-4">
            <ul className="grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-card">
              {trust.map((s) => (
                <li key={s.title} className="flex flex-col items-center gap-2 px-2 py-4 text-center">
                  <Image src={s.icon} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
                  <span className="text-xs leading-tight"><strong className="block font-semibold capitalize">{s.title.toLowerCase()}</strong><span className="text-muted">{s.text}</span></span>
                </li>
              ))}
            </ul>
            {site.productTemplate.wd_text_block && (
              <details className="group rounded-2xl border border-line bg-card">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                  Shipping &amp; ordering info
                  <IconChevronDown width={18} className="transition group-open:rotate-180" />
                </summary>
                <div className="rich border-t border-line px-5 py-4 text-[15px] prose-h3:mt-0 prose-h3:text-base" dangerouslySetInnerHTML={{ __html: site.productTemplate.wd_text_block }} />
              </details>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink px-5 py-4 text-sm text-white">
              <span className="text-white/70">Questions about this product?</span>
              <Link href="/contact-us" className="inline-flex items-center gap-1.5 font-semibold text-lime hover:underline">Talk to an expert <IconArrowRight width={16} /></Link>
            </div>
          </div>
        }
      >
        <p className="eyebrow">{p.categories.map(categoryName).join(' · ')}</p>
        <h1 className="h-display mt-3 text-[32px] leading-[1.08] sm:text-[44px]">{p.name}</h1>
        {avg != null && (
          <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink">
            <Stars rating={avg} size={16} /><span className="font-semibold text-ink">{avg.toFixed(1)}</span>· {p.reviews.length} review{p.reviews.length === 1 ? '' : 's'}
          </a>
        )}
        {p.shortDescription && <div className="rich mt-5 text-ink-soft" dangerouslySetInnerHTML={{ __html: p.shortDescription }} />}
      </ProductBuyBox>

      {p.description && (
        <section className="mt-20 grid gap-6 border-t border-line pt-12 sm:mt-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16" aria-labelledby="desc">
          <h2 id="desc" className="h-display text-3xl">Description</h2>
          <div className="rich max-w-3xl" dangerouslySetInnerHTML={{ __html: p.description }} />
        </section>
      )}

      <section id="reviews" className="mt-20 grid scroll-mt-28 gap-10 border-t border-line pt-12 sm:mt-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16" aria-labelledby="reviews-title">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="reviews-title" className="h-display text-3xl">Customer reviews</h2>
          {avg != null && (
            <div className="mt-6">
              <p className="flex items-end gap-3"><span className="font-display text-6xl font-bold leading-none tracking-tight">{avg.toFixed(1)}</span><span className="pb-1 text-sm text-muted">out of 5</span></p>
              <div className="mt-3"><Stars rating={avg} size={18} /></div>
              <p className="mt-1 text-sm text-muted">Based on {p.reviews.length} review{p.reviews.length === 1 ? '' : 's'}</p>
              <ul className="mt-6 space-y-2" aria-label="Rating breakdown">
                {dist.map(({ n, c }) => (
                  <li key={n} className="flex items-center gap-3 text-sm">
                    <span className="w-3 tabular-nums text-muted">{n}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-gold" style={{ width: `${(100 * c) / p.reviews.length}%` }} /></span>
                    <span className="w-6 text-right tabular-nums text-muted">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="min-w-0">
          {p.reviews.length ? (
            <>
              <ol className="divide-y divide-line">
                {p.reviews.slice(0, REVIEWS_SHOWN).map((r, i) => <ReviewItem key={i} review={r} />)}
              </ol>
              {p.reviews.length > REVIEWS_SHOWN && <MoreReviews slug={p.slug} offset={REVIEWS_SHOWN} total={p.reviews.length} />}
            </>
          ) : <p className="text-muted">There are no reviews yet. Be the first to share your thoughts.</p>}
          <div className="mt-8"><ReviewForm slug={p.slug} productName={p.name} /></div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-20 sm:mt-28">
          <ProductRail title="You may also like" href={`/product-category/${cat}`}>
            {related.map((r) => <ProductCard key={r.slug} product={r} />)}
          </ProductRail>
        </section>
      )}
    </div>
  );
}

/** Reviews rendered into the page HTML; the rest load on demand via MoreReviews. */
const REVIEWS_SHOWN = 6;
