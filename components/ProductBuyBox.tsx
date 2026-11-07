'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cartActions } from '@/lib/client-store';
import { formatMoney, percentOff } from '@/lib/money';
import { MAX_QTY } from '@/lib/pricing';
import type { Product } from '@/lib/types';
import Gallery from './Gallery';
import { IconCheck, IconMinus, IconPlus } from './Icons';
import WishlistButton from './WishlistButton';

/** Gallery + price + options + quantity + add-to-cart, kept in one client island so
 *  choosing a variation updates price and image together. `footer` renders under the CTAs. */
export default function ProductBuyBox({ product: p, children, footer }: { product: Product; children?: React.ReactNode; footer?: React.ReactNode }) {
  const router = useRouter();
  const [variationId, setVariationId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<'idle' | 'added' | 'need-option'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  // Mobile sticky buy bar: shown whenever the main CTA row is off screen.
  const ctaRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLFieldSetElement>(null);
  const [ctaVisible, setCtaVisible] = useState(true);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCtaVisible(e.isIntersecting), { rootMargin: '0px 0px -64px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const chooseOption = () => {
    optionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    optionsRef.current?.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus({ preventScroll: true });
    setStatus('need-option');
  };

  const v = p.variations.find((x) => x.id === variationId) ?? null;
  const needsOption = p.variations.length > 0;
  const unit = v ? v.price : p.price;
  const regular = v ? v.regularPrice : p.regularPrice;
  const inStock = v ? v.inStock : p.inStock;
  const off = needsOption && !v ? null : percentOff(unit, regular);

  function add(goToCheckout: boolean) {
    if (needsOption && !v) { setStatus('need-option'); return; }
    cartActions.add({
      slug: p.slug, variationId: v?.id ?? null, qty, name: p.name,
      option: v ? `${p.attribute?.label ?? 'Option'}: ${v.value}` : null,
      image: v?.image ?? p.images[0] ?? '', unitPrice: unit,
    });
    if (goToCheckout) { router.push('/checkout'); return; }
    setStatus('added');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 3000);
  }

  const range = needsOption ? [Math.min(...p.variations.map((x) => x.price)), Math.max(...p.variations.map((x) => x.price))] : null;
  const stepBtn = 'grid h-full w-10 place-items-center sm:w-11 rounded-full text-ink-soft transition hover:bg-paper hover:text-ink disabled:opacity-30';

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <Gallery images={p.images} alt={p.imageAlt} activeImage={v?.image} />
      </div>

      <div className="min-w-0">
        {children}

        <div className="mt-6 flex flex-wrap items-center gap-3" aria-live="polite">
          {v || !range ? (
            <>
              <span className={`font-display text-[34px] font-semibold tabular-nums tracking-tight ${regular && regular > unit ? 'text-sale' : ''}`}>{formatMoney(unit)}</span>
              {regular && regular > unit && <del className="text-lg tabular-nums text-muted"><span className="sr-only">Original price was: </span>{formatMoney(regular)}</del>}
              {off && <span className="badge bg-sale text-white">Save {off}%</span>}
            </>
          ) : (
            <span className="font-display text-[34px] font-bold tabular-nums tracking-tight">{formatMoney(range[0])} <span className="text-muted">–</span> {formatMoney(range[1])}</span>
          )}
        </div>
        <p className={`mt-2 inline-flex items-center gap-2 text-sm font-medium ${inStock ? 'text-brand-700' : 'text-sale'}`}>
          <span className={`h-2 w-2 rounded-full ${inStock ? 'bg-brand animate-pulse' : 'bg-sale'}`} aria-hidden />{inStock ? 'In stock, ready to ship' : 'Currently out of stock'}
        </p>

        <div className="my-7 h-px bg-line" />

        {needsOption && p.attribute && (
          <fieldset ref={optionsRef} className="mb-7 scroll-mt-32">
            <legend className="mb-3 text-sm font-semibold">{p.attribute.label}{v ? <span className="font-normal text-muted">: {v.value}</span> : ''}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {p.variations.map((x) => (
                <label key={x.id} className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-700 has-[:focus-visible]:ring-offset-2 ${variationId === x.id ? 'border-ink bg-ink text-white' : 'border-line-strong bg-card hover:border-ink'} ${!x.inStock ? 'cursor-not-allowed opacity-40 line-through' : ''}`}>
                  <input type="radio" name="variation" className="sr-only" value={x.id} checked={variationId === x.id} disabled={!x.inStock}
                    onChange={() => { setVariationId(x.id); setStatus('idle'); }} />
                  <span className="font-semibold">{x.value}</span>
                  <span className={`tabular-nums ${variationId === x.id ? 'text-white/70' : 'text-muted'}`}>{formatMoney(x.price)}</span>
                </label>
              ))}
            </div>
            {status === 'need-option' && <p role="alert" className="mt-3 text-sm font-medium text-sale">Please select a {p.attribute.label.toLowerCase()} first.</p>}
          </fieldset>
        )}

        <div ref={ctaRef} className="flex items-stretch gap-2 sm:gap-3">
          <div className="flex h-13 shrink-0 items-center rounded-full border border-line-strong bg-card p-1" role="group" aria-label="Quantity">
            <button type="button" className={stepBtn} onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity"><IconMinus width={18} /></button>
            <label htmlFor="qty" className="sr-only">Quantity</label>
            <input id="qty" type="number" inputMode="numeric" min={1} max={MAX_QTY} value={qty}
              onChange={(e) => setQty(Math.min(MAX_QTY, Math.max(1, Number(e.target.value) || 1)))}
              className="w-10 bg-transparent text-center font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
            <button type="button" className={stepBtn} onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} disabled={qty >= MAX_QTY} aria-label="Increase quantity"><IconPlus width={18} /></button>
          </div>
          <button type="button" className={`btn btn-lg min-w-0 flex-1 px-4 ${status === 'added' ? 'bg-brand-700 text-white' : 'btn-primary'}`} onClick={() => add(false)} disabled={!inStock}>
            {!inStock ? 'Out of stock' : status === 'added' ? <><IconCheck width={18} /> Added to cart</> : 'Add to cart'}
          </button>
          <WishlistButton slug={p.slug} name={p.name} className="!h-13 !w-13 shrink-0 border border-line-strong !shadow-none" />
        </div>
        <button type="button" className="btn btn-lg btn-ghost mt-3 w-full" onClick={() => add(true)} disabled={!inStock}>Buy it now</button>

        <p className="sr-only" aria-live="polite">{status === 'added' ? `${p.name} added to cart` : ''}</p>
        {status === 'added' && (
          <div className="mt-4 flex animate-fade-up items-center justify-between gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-900">
            <span className="flex items-center gap-2"><IconCheck width={16} /> Added {qty > 1 ? `${qty} × ` : ''}to your cart</span>
            <Link href="/cart" className="font-semibold underline underline-offset-2">View cart</Link>
          </div>
        )}

        {footer}
      </div>

      {/* mobile sticky buy bar (replaces the tab bar on product pages, see MobileTabBar) */}
      <div aria-hidden={ctaVisible} inert={ctaVisible}
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/[0.97] pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgb(12_20_17/0.18)] transition-transform duration-300 ease-out-soft lg:hidden ${ctaVisible ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className="container-x flex items-center gap-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">{v ? `${p.attribute?.label ?? 'Option'}: ${v.value}` : p.name}</p>
            <p className={`text-lg font-semibold tabular-nums leading-tight ${regular && regular > unit && (v || !range) ? 'text-sale' : ''}`}>
              {v || !range ? formatMoney(unit * qty) : <><span className="text-xs font-normal text-muted">From </span>{formatMoney(range[0])}</>}
            </p>
          </div>
          {needsOption && !v ? (
            <button type="button" className="btn btn-primary h-12 px-6" onClick={chooseOption}>Choose {p.attribute?.label.toLowerCase() ?? 'option'}</button>
          ) : (
            <button type="button" className={`btn h-12 px-6 ${status === 'added' ? 'bg-brand-700 text-white' : 'btn-primary'}`} onClick={() => add(false)} disabled={!inStock}>
              {!inStock ? 'Out of stock' : status === 'added' ? <><IconCheck width={18} /> Added</> : 'Add to cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
