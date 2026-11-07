import Link from 'next/link';
import { listProducts, priceBounds, products, SORTS, visibleCategories } from '@/lib/catalog';
import AutoSubmitSelect from './AutoSubmitSelect';
import Pagination from './Pagination';
import ProductGrid from './ProductGrid';

export type ListingParams = { q?: string; sort?: string; page?: string; min?: string; max?: string };

const num = (v?: string) => (v && /^\d+(\.\d+)?$/.test(v) ? Number(v) : undefined);

export default function Listing({ basePath, title, intro, category, params }: {
  basePath: string; title: string; intro?: string; category?: string; params: ListingParams;
}) {
  const q = params.q?.trim().slice(0, 100) || undefined;
  const min = num(params.min), max = num(params.max);
  const res = listProducts({ q, category, sort: params.sort, page: num(params.page), min, max });
  const bounds = priceBounds();
  const cats = visibleCategories();
  const keep = (extra: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    const all = { q, sort: res.sort === 'default' ? undefined : res.sort, min, max, ...extra };
    for (const [k, v] of Object.entries(all)) if (v !== undefined && v !== '' && !(k === 'page' && v === 1)) sp.set(k, String(v));
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const filtered = q || min != null || max != null;

  return (
    <div className="container-x pt-8 sm:pt-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap gap-2"><li><Link href="/" className="hover:text-ink">Home</Link></li><li aria-hidden>/</li>
          {category && <><li><Link href="/shop" className="hover:text-ink">Shop</Link></li><li aria-hidden>/</li></>}
          <li aria-current="page" className="text-ink">{title}</li></ol>
      </nav>
      <header className="mt-4 max-w-3xl">
        <h1 className="h-display text-4xl sm:text-5xl">{q ? <>Results for “{q}”</> : title}</h1>
        {intro && <div className="rich mt-4 text-ink-soft" dangerouslySetInnerHTML={{ __html: intro }} />}
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="min-w-0 space-y-8" aria-label="Filters">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Categories</h2>
            <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 [scrollbar-width:none]">
              <li><Link href="/shop" aria-current={!category ? 'page' : undefined} className={`block whitespace-nowrap rounded-full px-4 py-2 text-sm lg:rounded-xl ${!category ? 'bg-ink text-white' : 'bg-white hover:bg-sage-50 lg:bg-transparent'}`}>All products <span className="opacity-60">({products.length})</span></Link></li>
              {cats.map((c) => (
                <li key={c.slug}><Link href={`/product-category/${c.slug}`} aria-current={category === c.slug ? 'page' : undefined}
                  className={`block whitespace-nowrap rounded-full px-4 py-2 text-sm lg:rounded-xl ${category === c.slug ? 'bg-ink text-white' : 'bg-white hover:bg-sage-50 lg:bg-transparent'}`}>{c.name} <span className="opacity-60">({c.products.length})</span></Link></li>
              ))}
            </ul>
          </div>
          <form action={basePath} className="hidden space-y-3 lg:block">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Filter by price</h2>
            {q && <input type="hidden" name="q" value={q} />}
            {res.sort !== 'default' && <input type="hidden" name="sort" value={res.sort} />}
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="min">Minimum price</label>
              <input id="min" name="min" type="number" inputMode="numeric" min={0} placeholder={`$${bounds.min}`} defaultValue={min} className="field py-2" />
              <span className="text-muted">–</span>
              <label className="sr-only" htmlFor="max">Maximum price</label>
              <input id="max" name="max" type="number" inputMode="numeric" min={0} placeholder={`$${bounds.max}`} defaultValue={max} className="field py-2" />
            </div>
            <button className="btn btn-ghost w-full py-2">Apply</button>
          </form>
        </aside>

        <section className="min-w-0" aria-label="Products">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              {res.total === 0 ? 'No products found' : `Showing ${(res.page - 1) * 12 + 1}–${Math.min(res.page * 12, res.total)} of ${res.total} results`}
              {filtered && <> · <Link href={basePath} className="font-medium text-sage-700 hover:underline">Clear filters</Link></>}
            </p>
            <form action={basePath} className="flex items-center gap-2">
              {q && <input type="hidden" name="q" value={q} />}
              {min != null && <input type="hidden" name="min" value={min} />}
              {max != null && <input type="hidden" name="max" value={max} />}
              <label htmlFor="sort" className="sr-only">Sort products</label>
              <AutoSubmitSelect id="sort" name="sort" defaultValue={res.sort} className="field w-auto py-2 pr-8">
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </AutoSubmitSelect>
              <noscript><button className="btn btn-ghost py-2">Sort</button></noscript>
            </form>
          </div>
          {res.items.length ? <ProductGrid products={res.items} priorityCount={4} /> : (
            <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center">
              <p className="text-lg font-medium">No products were found matching your selection.</p>
              <Link href="/shop" className="btn btn-primary mt-6">Browse all products</Link>
            </div>
          )}
          <Pagination page={res.page} pageCount={res.pageCount} href={(p) => keep({ page: p })} />
        </section>
      </div>
    </div>
  );
}
