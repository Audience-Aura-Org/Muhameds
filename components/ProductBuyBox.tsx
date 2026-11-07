'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cartActions } from '@/lib/client-store';
import { formatMoney, percentOff } from '@/lib/money';
import { MAX_QTY } from '@/lib/pricing';
import type { Product } from '@/lib/types';
import Gallery from './Gallery';
import { IconCheck, IconMinus, IconPlus } from './Icons';
import WishlistButton from './WishlistButton';

/** Gallery + price + options + quantity + add-to-cart, kept in one client island so
 *  choosing a variation updates price and image together. */
export default function ProductBuyBox({ product: p, children }: { product: Product; children?: React.ReactNode }) {
  const router = useRouter();
  const [variationId, setVariationId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<'idle' | 'added' | 'need-option'>('idle');
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
    if (goToCheckout) router.push('/checkout');
    else { setStatus('added'); setTimeout(() => setStatus('idle'), 2500); }
  }

  const range = needsOption ? [Math.min(...p.variations.map((x) => x.price)), Math.max(...p.variations.map((x) => x.price))] : null;

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <Gallery images={p.images} alt={p.imageAlt} activeImage={v?.image} />
      </div>
      <div>
        {children}
        <div className="mt-6 flex items-baseline gap-3" aria-live="polite">
          {v || !range ? (
            <>
              {regular && regular > unit && <del className="text-lg text-muted"><span className="sr-only">Original price was: </span>{formatMoney(regular)}</del>}
              <span className={`font-display text-3xl font-semibold ${regular && regular > unit ? 'text-sale' : ''}`}>{formatMoney(unit)}</span>
              {off && <span className="rounded-full bg-sale/10 px-2.5 py-1 text-xs font-bold text-sale">Save {off}%</span>}
            </>
          ) : (
            <span className="font-display text-3xl font-semibold">{formatMoney(range[0])} – {formatMoney(range[1])}</span>
          )}
        </div>

        {needsOption && p.attribute && (
          <fieldset className="mt-6">
            <legend className="label">{p.attribute.label}{v ? `: ${v.value}` : ''}</legend>
            <div className="flex flex-wrap gap-2">
              {p.variations.map((x) => (
                <label key={x.id} className={`cursor-pointer rounded-full border px-5 py-2.5 text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sage-700 ${variationId === x.id ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink'} ${!x.inStock ? 'opacity-40' : ''}`}>
                  <input type="radio" name="variation" className="sr-only" value={x.id} checked={variationId === x.id} disabled={!x.inStock}
                    onChange={() => { setVariationId(x.id); setStatus('idle'); }} />
                  {x.value} <span className="opacity-70">· {formatMoney(x.price)}</span>
                </label>
              ))}
            </div>
            {status === 'need-option' && <p role="alert" className="mt-2 text-sm text-sale">Please select a {p.attribute.label.toLowerCase()} before adding to cart.</p>}
          </fieldset>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full border border-line bg-white" role="group" aria-label="Quantity">
            <button type="button" className="grid h-12 w-12 place-items-center rounded-full hover:bg-sage-50 disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity"><IconMinus width={18} /></button>
            <label htmlFor="qty" className="sr-only">Quantity</label>
            <input id="qty" type="number" inputMode="numeric" min={1} max={MAX_QTY} value={qty}
              onChange={(e) => setQty(Math.min(MAX_QTY, Math.max(1, Number(e.target.value) || 1)))}
              className="w-12 bg-transparent text-center font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
            <button type="button" className="grid h-12 w-12 place-items-center rounded-full hover:bg-sage-50 disabled:opacity-30" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} disabled={qty >= MAX_QTY} aria-label="Increase quantity"><IconPlus width={18} /></button>
          </div>
          <button type="button" className="btn btn-accent h-12 flex-1" onClick={() => add(false)} disabled={!inStock}>
            {!inStock ? 'Out of stock' : status === 'added' ? <><IconCheck width={18} /> Added to cart</> : 'Add to cart'}
          </button>
          <WishlistButton slug={p.slug} name={p.name} className="!h-12 !w-12 border border-line" />
        </div>
        <button type="button" className="btn btn-primary mt-3 h-12 w-full" onClick={() => add(true)} disabled={!inStock}>Buy now</button>
        <p className="sr-only" aria-live="polite">{status === 'added' ? `${p.name} added to cart` : ''}</p>
        {status === 'added' && (
          <p className="mt-3 text-sm text-sage-700">Added to your cart. <Link href="/cart" className="font-semibold underline">View cart</Link></p>
        )}
      </div>
    </div>
  );
}
