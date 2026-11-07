import Image from 'next/image';
import Link from 'next/link';
import { getProducts, products, site, visibleCategories } from '@/lib/catalog';
import HeroSlider from '@/components/HeroSlider';
import ProductGrid from '@/components/ProductGrid';
import SectionHeading from '@/components/SectionHeading';
import { IconCheck } from '@/components/Icons';
import Services from '@/components/Services';

export default function HomePage() {
  const h = site.home;
  const sections = site.homeSections.map((s) => ({ ...s, items: getProducts(s.products) }));
  const onSale = products.filter((p) => p.regularPrice && p.regularPrice > p.price);
  const cats = visibleCategories();

  return (
    <>
      <div className="container-x pt-4 sm:pt-6">
        <HeroSlider slides={site.heroSlides} />
      </div>

      {/* marquee */}
      <div className="mt-6 overflow-hidden border-y border-line bg-white py-4" aria-label="Store highlights">
        <ul className="animate-marquee flex w-max gap-12 whitespace-nowrap">
          {[...h.marquee, ...h.marquee, ...h.marquee, ...h.marquee].map((m, i) => (
            <li key={i} className="flex items-center gap-3 font-display text-lg font-medium" aria-hidden={i >= h.marquee.length}>
              <Image src={m.icon} alt="" width={28} height={28} />{m.text}
            </li>
          ))}
        </ul>
      </div>

      {/* categories */}
      <section className="container-x mt-16" aria-labelledby="cats">
        <h2 id="cats" className="sr-only">Shop by category</h2>
        <ul className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
          <li><Link href="/shop" className="btn btn-primary whitespace-nowrap">All products ({products.length})</Link></li>
          {cats.map((c) => <li key={c.slug}><Link href={`/product-category/${c.slug}`} className="btn btn-ghost whitespace-nowrap">{c.name} ({c.products.length})</Link></li>)}
        </ul>
      </section>

      {/* intro */}
      <section className="container-x mt-16 grid items-center gap-10 lg:grid-cols-2">
        <h2 className="h-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
          {h.intro.heading[0]} {h.intro.heading[1]} <span className="text-sage-700">{h.intro.heading[2]}</span>
        </h2>
        <div className="space-y-4 text-lg leading-relaxed text-ink-soft">
          <h3 className="font-display text-xl font-semibold text-ink">{h.intro.title}</h3>
          {h.intro.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>

      {/* sale products */}
      {sections[0] && (
        <section className="container-x mt-24">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
            <Link href="/shop?sort=price-asc" className="group relative hidden overflow-hidden rounded-3xl lg:block">
              <Image src={h.banners[0].image} alt="" fill sizes="340px" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <p className="absolute bottom-6 left-6 font-display text-3xl font-semibold text-white">{h.banners[0].title}</p>
            </Link>
            <div>
              <SectionHeading title={sections[0].title} eyebrow={`${onSale.length} products on sale`} href="/shop" />
              <ProductGrid products={sections[0].items.slice(0, 4)} />
            </div>
          </div>
        </section>
      )}

      {/* remaining curated sections */}
      {sections.slice(1).map((s) => (
        <section key={s.title} className="container-x mt-24">
          <SectionHeading title={s.title} href="/shop" />
          <ProductGrid products={s.items.slice(0, 8)} />
        </section>
      ))}

      {/* passion */}
      <section className="container-x mt-24">
        <div className="grid overflow-hidden rounded-[2rem] bg-ink text-white lg:grid-cols-2">
          <div className="relative min-h-[320px]">
            <Image src={h.passion.image} alt="" fill sizes="(min-width:1024px) 660px, 100vw" className="object-cover" />
          </div>
          <div className="space-y-5 p-8 sm:p-12 lg:p-16">
            <h2 className="font-display text-4xl font-semibold tracking-tight">{h.passion.title}</h2>
            {h.passion.body.map((p, i) => <p key={i} className="leading-relaxed text-white/75">{p}</p>)}
            <ul className="space-y-3 pt-2">
              {h.passion.points.map((p) => <li key={p} className="flex gap-3"><IconCheck className="mt-0.5 shrink-0 text-gold" />{p}</li>)}
            </ul>
            <Link href={h.help.href} className="btn mt-4 bg-white text-ink hover:bg-gold">{h.help.title} {h.help.cta}</Link>
          </div>
        </div>
      </section>

      {/* featured + best sellers */}
      <section className="container-x mt-24">
        <SectionHeading title={h.featuredTitle} href="/shop" />
        <ProductGrid products={getProducts(h.featured)} />
      </section>
      <section className="container-x mt-24">
        <SectionHeading title={h.bestSellersTitle} href="/shop?sort=popularity" />
        <ProductGrid products={getProducts(h.bestSellers)} />
      </section>

      {site.testimonials.length > 0 && (
        <section className="container-x mt-24">
          <SectionHeading title="Customer Testimonials" />
          <ul className="grid gap-5 md:grid-cols-3">
            {site.testimonials.map((t) => (
              <li key={t.name} className="rounded-3xl border border-line bg-white p-6">
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
