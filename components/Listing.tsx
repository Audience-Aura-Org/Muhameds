import IntentLink from '@/components/IntentLink';
import { listProducts, priceBounds, products, SORTS, visibleCategories } from '@/lib/catalog';
import AutoSubmitSelect from './AutoSubmitSelect';
import { IconClose, IconSliders } from './Icons';
import Pagination from './Pagination';
import ProductGrid from './ProductGrid';

export type ListingParams = { q?: string; sort?: string; page?: string; min?: string; max?: string };

const PAGE_SIZE = 12;
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
  const priceActive = min != null || max != null;
  const filtered = q || priceActive;

  const priceForm = (idPrefix: string) => (
    <form action={basePath} className="space-y-3">
      {q && <input type="hidden" name="q" value={q} />}
      {res.sort !== 'default' && <input type="hidden" name="sort" value={res.sort} />}
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`${idPrefix}-min`}>Minimum price</label>
        <input id={`${idPrefix}-min`} name="min" type="number" inputMode="numeric" min={0} placeholder={`$${bounds.min}`} defaultValue={min} className="field h-11" />
        <span className="text-muted" aria-hidden>–</span>
        <label className="sr-only" htmlFor={`${idPrefix}-max`}>Maximum price</label>
        <input id={`${idPrefix}-max`} name="max" type="number" inputMode="numeric" min={0} placeholder={`$${bounds.max}`} defaultValue={max} className="field h-11" />
      </div>
      <button className="btn btn-primary w-full">Apply price</button>
    </form>
  );

  return (
    <div className="container-x pt-6 sm:pt-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
          <li><IntentLink href="/" className="transition hover:text-ink">Home</IntentLink></li><li aria-hidden className="text-line-strong">/</li>
          {category && <><li><IntentLink href="/shop" className="transition hover:text-ink">Shop</IntentLink></li><li aria-hidden className="text-line-strong">/</li></>}
          <li aria-current="page" className="text-ink">{title}</li>
        </ol>
      </nav>

      <header className="mt-4 flex flex-col items-center gap-3 border-b border-line pb-6 text-center sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4 sm:pb-8 sm:text-left">
        <div className="max-w-3xl">
          <h1 className="h-display text-[34px] leading-[1.05] sm:text-[56px]">{q ? <>Results for “{q}”</> : title}</h1>
          {intro && <div className="rich mt-4 text-ink-soft" dangerouslySetInnerHTML={{ __html: intro }} />}
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          {res.total === 0 ? 'No products found' : <><span className="font-semibold text-ink">{res.total}</span> product{res.total === 1 ? '' : 's'}</>}
        </p>
      </header>

      <div className="mt-6 grid gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-12">
        <aside className="min-w-0" aria-label="Filters">
          <div className="lg:sticky lg:top-28 lg:space-y-8">
            <div>
              <h2 className="mb-3 hidden text-xs font-semibold uppercase tracking-[0.16em] text-muted lg:block">Categories</h2>
              <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:gap-0.5 lg:px-0">
                <li><CatLink href="/shop" active={!category} label="All products" count={products.length} /></li>
                {cats.map((c) => <li key={c.slug}><CatLink href={`/product-category/${c.slug}`} active={category === c.slug} label={c.name} count={c.products.length} /></li>)}
              </ul>
            </div>
            <div className="hidden lg:block">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Price</h2>
              {priceForm('d')}
            </div>
          </div>
        </aside>

        <section className="min-w-0" aria-labelledby="products-title">
          <h2 id="products-title" className="sr-only">Products</h2>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* mobile price filter */}
              <details className="group relative lg:hidden">
                <summary className="chip cursor-pointer list-none [&::-webkit-details-marker]:hidden"><IconSliders width={16} height={16} />Price{priceActive ? ' · on' : ''}</summary>
                <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-2xl border border-line bg-card p-4 shadow-lift">{priceForm('m')}</div>
              </details>
              {q && <ActiveFilter label={`“${q}”`} href={keep({ q: undefined, page: undefined })} />}
              {priceActive && <ActiveFilter label={`$${min ?? bounds.min} – $${max ?? bounds.max}`} href={keep({ min: undefined, max: undefined, page: undefined })} />}
              {filtered ? <IntentLink href={basePath} className="px-2 text-sm font-medium text-brand-700 hover:underline">Clear all</IntentLink> : (
                <p className="hidden text-sm text-muted sm:block">
                  {res.total > 0 && `Showing ${(res.page - 1) * PAGE_SIZE + 1}–${Math.min(res.page * PAGE_SIZE, res.total)} of ${res.total}`}
                </p>
              )}
            </div>
            <form action={basePath} className="flex items-center gap-2">
              {q && <input type="hidden" name="q" value={q} />}
              {min != null && <input type="hidden" name="min" value={min} />}
              {max != null && <input type="hidden" name="max" value={max} />}
              <label htmlFor="sort" className="sr-only text-sm text-muted sm:not-sr-only">Sort by</label>
              <AutoSubmitSelect id="sort" name="sort" defaultValue={res.sort} className="field h-10 w-auto rounded-full sm:text-sm">
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </AutoSubmitSelect>
              <noscript><button className="btn btn-ghost btn-sm">Sort</button></noscript>
            </form>
          </div>

          {res.items.length ? <ProductGrid products={res.items} priorityCount={4} columns={3} /> : (
            <div className="rounded-3xl border border-dashed border-line-strong bg-card px-6 py-16 text-center">
              <p className="h-display text-2xl">Nothing matches that yet</p>
              <p className="mx-auto mt-2 max-w-sm text-muted">Try a different search or clear your filters to see the full range.</p>
              <IntentLink href="/shop" className="btn btn-primary mt-6">Browse all products</IntentLink>
            </div>
          )}
          <Pagination page={res.page} pageCount={res.pageCount} href={(p) => keep({ page: p })} />
        </section>
      </div>
    </div>
  );
}

function CatLink({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <IntentLink href={href} aria-current={active ? 'page' : undefined}
      className="chip lg:flex lg:h-10 lg:w-full lg:justify-between lg:rounded-xl lg:border-transparent lg:bg-transparent lg:px-3 lg:hover:bg-card lg:aria-[current=page]:border-ink lg:aria-[current=page]:bg-ink">
      {label}<span className="text-xs tabular-nums opacity-60">{count}</span>
    </IntentLink>
  );
}

function ActiveFilter({ label, href }: { label: string; href: string }) {
  return (
    <IntentLink href={href} className="chip chip-active" aria-label={`Remove filter ${label}`}>
      {label}<IconClose width={14} height={14} />
    </IntentLink>
  );
}
