import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { categoryName, getProduct, products, relatedProducts, site } from '@/lib/catalog';
import { SITE_URL } from '@/lib/site-url';
import ProductBuyBox from '@/components/ProductBuyBox';
import ProductGrid from '@/components/ProductGrid';
import ReviewForm from '@/components/ReviewForm';
import SectionHeading from '@/components/SectionHeading';
import Stars from '@/components/Stars';
import { IconMail, IconPin } from '@/components/Icons';

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

  return (
    <div className="container-x pt-8 sm:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap gap-2">
          <li><Link href="/" className="hover:text-ink">Home</Link></li><li aria-hidden>/</li>
          <li><Link href={`/product-category/${cat}`} className="hover:text-ink">{categoryName(cat)}</Link></li><li aria-hidden>/</li>
          <li aria-current="page" className="line-clamp-1 text-ink">{p.name}</li>
        </ol>
      </nav>

      <ProductBuyBox product={p}>
        <p className="eyebrow">{p.categories.map(categoryName).join(' · ')}</p>
        <h1 className="h-display mt-3 text-3xl leading-tight sm:text-4xl">{p.name}</h1>
        {avg != null && <a href="#reviews" className="mt-3 inline-flex hover:underline"><Stars rating={avg} count={p.reviews.length} size={16} /></a>}
        {p.shortDescription && <div className="rich mt-5 text-ink-soft" dangerouslySetInnerHTML={{ __html: p.shortDescription }} />}
      </ProductBuyBox>

      <div className="mt-8 grid gap-4 lg:ml-[calc(50%+2rem)]">
        {site.productTemplate.wd_text_block && (
          <div className="rich rounded-3xl bg-sage-50 p-6 text-[15px] prose-h3:mt-0 prose-h3:text-base" dangerouslySetInnerHTML={{ __html: site.productTemplate.wd_text_block }} />
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-white p-5 text-sm">
          <span className="flex items-center gap-2"><IconPin width={18} className="text-sage-700" />{site.address}</span>
          <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:underline"><IconMail width={18} className="text-sage-700" />{site.email}</a>
          <Link href="/contact-us" className="font-semibold text-sage-700 hover:underline">Need help choosing? Contact With Expert →</Link>
        </div>
      </div>

      {p.description && (
        <section className="mx-auto mt-20 max-w-3xl" aria-labelledby="desc">
          <h2 id="desc" className="h-display mb-6 text-3xl">Description</h2>
          <div className="rich" dangerouslySetInnerHTML={{ __html: p.description }} />
        </section>
      )}

      <section id="reviews" className="mx-auto mt-20 max-w-3xl scroll-mt-28" aria-labelledby="reviews-title">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="reviews-title" className="h-display text-3xl">Customer Reviews</h2>
          {avg != null && <p className="flex items-center gap-2 text-sm text-muted"><span className="font-display text-2xl font-semibold text-ink">{avg.toFixed(1)}</span><Stars rating={avg} /> {p.reviews.length} review{p.reviews.length === 1 ? '' : 's'}</p>}
        </div>
        {p.reviews.length ? (
          <ol className="space-y-4">
            {p.reviews.map((r, i) => (
              <li key={i} className="rounded-3xl border border-line bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{r.author}</p>
                  {r.date && <time dateTime={r.date} className="text-sm text-muted">{new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>}
                </div>
                <div className="mt-1"><Stars rating={r.rating} /></div>
                <div className="rich mt-3 text-ink-soft" dangerouslySetInnerHTML={{ __html: r.text }} />
              </li>
            ))}
          </ol>
        ) : <p className="text-muted">There are no reviews yet.</p>}
        <div className="mt-8"><ReviewForm slug={p.slug} productName={p.name} /></div>
      </section>

      {related.length > 0 && (
        <section className="mt-24">
          <SectionHeading title="Related products" href={`/product-category/${cat}`} />
          <ProductGrid products={related.slice(0, 4)} />
        </section>
      )}
    </div>
  );
}
