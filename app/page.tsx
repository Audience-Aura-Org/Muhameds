import type { Metadata } from 'next';
import Image from 'next/image';
import IntentLink from '@/components/IntentLink';
import { getProduct, getProducts, products, site, visibleCategories } from '@/lib/catalog';
import HeroSlider from '@/components/HeroSlider';
import ProductCard from '@/components/ProductCard';
import ProductGrid from '@/components/ProductGrid';
import ProductRail from '@/components/ProductRail';
import SectionHeading from '@/components/SectionHeading';
import { IconArrowRight, IconCheck } from '@/components/Icons';
import Services from '@/components/Services';
import JsonLd from '@/components/JsonLd';
import { organizationLd, websiteLd } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
};

export default function HomePage() {
  const h = site.home;
  const sections = site.homeSections.map((s) => ({ ...s, items: getProducts(s.products) }));
  const onSale = products.filter((p) => p.regularPrice && p.regularPrice > p.price);
  // largest categories first; each tile borrows its first product's photo
  const cats = visibleCategories()
    .map((c) => ({ ...c, image: getProduct(c.products[0])?.images[0] }))
    .sort((a, b) => b.products.length - a.products.length);

  return (
    <>
      <JsonLd data={[organizationLd, websiteLd]} />
      <div className="container-x pt-3 sm:pt-5">
        <HeroSlider slides={site.heroSlides} />
      </div>

      {/* highlights ticker */}
      <div className="mt-5 overflow-hidden bg-lime py-3.5 text-ink" aria-label="Store highlights">
        <ul className="flex w-max animate-marquee gap-14 whitespace-nowrap hover:[animation-play-state:paused]">
          {Array.from({ length: 4 }, () => h.marquee).flat().map((m, i) => (
            <li key={i} className="flex items-center gap-3 font-display text-[17px] font-bold tracking-tight" aria-hidden={i >= h.marquee.length || undefined}>
              <Image src={m.icon} alt="" width={24} height={24} />{m.text}
              <span className="ml-11 text-ink/30" aria-hidden>✦</span>
            </li>
          ))}
        </ul>
      </div>

      {/* categories */}
      <section className="container-x mt-12 sm:mt-20" aria-labelledby="cats-title">
        <SectionHeading id="cats-title" title="Shop by category" href="/shop" linkLabel={`All ${products.length} products`} />
        <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0 lg:grid-cols-5">
          {cats.map((c) => (
            <li key={c.slug} className="w-[42%] shrink-0 snap-start sm:w-auto">
              <IntentLink href={`/product-category/${c.slug}`} className="group flex h-full flex-col rounded-2xl border border-line bg-card p-3 transition duration-300 can-hover:hover:-translate-y-0.5 can-hover:hover:border-transparent can-hover:hover:shadow-lift">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl img-well">
                  {c.image && <Image src={c.image} alt="" fill sizes="(min-width:1024px) 240px, (min-width:640px) 30vw, 42vw" className="object-contain p-3 img-blend transition-transform duration-500 can-hover:group-hover:scale-105" />}
                </div>
                <div className="flex items-center justify-center gap-2 px-1 pb-1 pt-3 text-center sm:justify-between sm:text-left">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{c.name}</span>
                    <span className="text-xs text-muted">{c.products.length} product{c.products.length === 1 ? '' : 's'}</span>
                  </span>
                  <span className="hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-paper transition group-hover:bg-ink group-hover:text-white sm:grid" aria-hidden><IconArrowRight width={15} height={15} /></span>
                </div>
              </IntentLink>
            </li>
          ))}
        </ul>
      </section>

      {/* sale: banner + rail */}
      {sections[0] && (
        <section className="container-x mt-14 sm:mt-24 lg:mt-28">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-8">
            <IntentLink href="/shop?sort=price-asc" className="group relative hidden overflow-hidden rounded-3xl lg:block">
              <Image src={h.banners[0].image} alt="" fill sizes="320px" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
              <div className="absolute inset-x-6 bottom-6 text-white">
                <span className="badge bg-sale text-white">Up to {Math.max(...onSale.map((p) => Math.round(100 - (100 * p.price) / p.regularPrice!)))}% off</span>
                <p className="mt-3 font-display text-3xl font-bold leading-tight">Sale products</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-lime">Shop the sale <IconArrowRight width={16} height={16} className="transition group-hover:translate-x-0.5" /></span>
              </div>
            </IntentLink>
            <div className="min-w-0">
              <ProductRail title={sections[0].title} eyebrow={`${onSale.length} products on sale`} href="/shop">
                {sections[0].items.map((p) => <ProductCard key={p.slug} product={p} />)}
              </ProductRail>
            </div>
          </div>
        </section>
      )}

      {sections.slice(1).map((s) => (
        <section key={s.title} className="container-x mt-14 sm:mt-24 lg:mt-28">
          <ProductRail title={s.title} href="/shop">
            {s.items.map((p) => <ProductCard key={p.slug} product={p} />)}
          </ProductRail>
        </section>
      ))}

      {/* editorial intro */}
      <section className="container-x mt-14 sm:mt-24 lg:mt-28">
        <div className="grid gap-6 border-t border-line pt-12 text-center lg:grid-cols-[1.15fr_1fr] lg:gap-20 lg:pt-16 lg:text-left">
          <h2 className="h-display text-[34px] leading-[1.05] sm:text-5xl lg:text-[56px]">
            {h.intro.heading[0]} {h.intro.heading[1]} <span className="text-brand-700">{h.intro.heading[2].toLowerCase()}</span>
          </h2>
          <div className="mx-auto max-w-xl space-y-4 text-base leading-relaxed text-ink-soft sm:text-[17px] lg:mx-0">
            <h3 className="font-display text-xl font-bold text-ink">{h.intro.title}</h3>
            {h.intro.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* brand story */}
      <section className="container-x mt-14 sm:mt-24 lg:mt-28">
        <div className="grid overflow-hidden rounded-3xl bg-ink text-white lg:grid-cols-2">
          <div className="relative min-h-[260px] sm:min-h-[340px] lg:min-h-[560px]">
            <Image src={h.passion.image} alt="" fill sizes="(min-width:1024px) 680px, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col items-center justify-center p-6 py-10 text-center sm:p-12 lg:items-start lg:p-16 lg:text-left">
            <p className="eyebrow !text-lime">Our story</p>
            <h2 className="mt-4 font-display text-[34px] font-bold tracking-[-0.02em] sm:text-5xl">{h.passion.title}</h2>
            <div className="mt-6 space-y-4 leading-relaxed text-white/70">
              {h.passion.body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <ul className="mt-8 space-y-3.5 text-left">
              {h.passion.points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime/15 text-lime"><IconCheck width={14} height={14} /></span>
                  <span className="text-white/90">{p}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <IntentLink href={h.help.href} className="btn btn-lime btn-lg">{h.help.cta}</IntentLink>
              <span className="text-sm text-white/60">{h.help.title}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x mt-14 sm:mt-24 lg:mt-28">
        <SectionHeading title={h.featuredTitle} href="/shop" />
        <ProductGrid products={getProducts(h.featured)} />
      </section>

      <section className="container-x mt-14 sm:mt-24 lg:mt-28">
        <ProductRail title={h.bestSellersTitle} href="/shop?sort=popularity">
          {getProducts(h.bestSellers).map((p) => <ProductCard key={p.slug} product={p} />)}
        </ProductRail>
      </section>

      {site.testimonials.length > 0 && (
        <section className="container-x mt-14 sm:mt-24 lg:mt-28">
          <SectionHeading title="What customers say" />
          <ul className="grid gap-4 md:grid-cols-3">
            {site.testimonials.map((t) => (
              <li key={t.name} className="surface p-6 text-center md:text-left">
                <blockquote className="text-ink-soft">“{t.text}”</blockquote>
                <p className="mt-4 font-semibold">{t.name}{t.location ? `, ${t.location}` : ''}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Services />
    </>
  );
}
