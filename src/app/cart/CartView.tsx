'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cartActions, useCart } from '@/lib/client-store';
import { formatMoney } from '@/lib/money';
import { MAX_QTY } from '@/lib/pricing';
import { useQuote } from '@/lib/use-quote';
import OrderSummary from '@/components/OrderSummary';
import { IconMinus, IconPlus, IconTrash } from '@/components/Icons';

export default function CartView() {
  const cart = useCart();
  const { quote, loading } = useQuote(cart.lines, cart.coupon);
  const [code, setCode] = useState('');

  if (!cart.lines.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-line bg-white p-12 text-center">
        <p className="h-display text-2xl">Your cart is currently empty.</p>
        <Link href="/shop" className="btn btn-primary mt-6">Return to shop</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <section aria-label="Cart items">
        {quote?.issues.length ? <ul role="alert" className="mb-4 space-y-1 rounded-2xl bg-sale/10 p-4 text-sm text-sale">{quote.issues.map((i) => <li key={i}>{i}</li>)}</ul> : null}
        <ul className="divide-y divide-line rounded-[2rem] border border-line bg-white">
          {cart.lines.map((l) => (
            <li key={`${l.slug}-${l.variationId}`} className="flex gap-4 p-4 sm:p-5">
              <Link href={`/product/${l.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-sage-50">
                {l.image && <Image src={l.image} alt="" fill sizes="96px" className="object-contain p-2" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${l.slug}`} className="font-semibold hover:underline">{l.name}</Link>
                  {l.option && <p className="text-sm text-muted">{l.option}</p>}
                  <p className="text-sm text-muted">{formatMoney(l.unitPrice)} each</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center rounded-full border border-line" role="group" aria-label={`Quantity for ${l.name}`}>
                    <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-sage-50" onClick={() => cartActions.setQty(l.slug, l.variationId, l.qty - 1)} aria-label="Decrease quantity"><IconMinus width={16} /></button>
                    <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{l.qty}</span>
                    <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-sage-50 disabled:opacity-30" disabled={l.qty >= MAX_QTY} onClick={() => cartActions.setQty(l.slug, l.variationId, l.qty + 1)} aria-label="Increase quantity"><IconPlus width={16} /></button>
                  </div>
                  <p className="w-20 text-right font-semibold">{formatMoney(l.unitPrice * l.qty)}</p>
                  <button className="rounded-full p-2 text-muted hover:bg-sale/10 hover:text-sale" onClick={() => cartActions.remove(l.slug, l.variationId)} aria-label={`Remove ${l.name}`}><IconTrash width={18} /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/shop" className="mt-4 inline-block text-sm font-semibold text-sage-700 hover:underline">← Continue shopping</Link>
      </section>

      <aside className="h-fit space-y-6 rounded-[2rem] border border-line bg-white p-6 lg:sticky lg:top-28" aria-label="Cart totals">
        <h2 className="h-display text-2xl">Cart totals</h2>
        <form onSubmit={(e) => { e.preventDefault(); cartActions.setCoupon(code.trim()); }} className="flex gap-2">
          <label htmlFor="coupon" className="sr-only">Coupon code</label>
          <input id="coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder={cart.coupon || 'Coupon code'} className="field py-2.5" />
          <button className="btn btn-ghost py-2.5">Apply</button>
        </form>
        {cart.coupon && (
          <p className="text-sm" role="status">
            {quote?.couponMessage ? <span className="text-sale">{quote.couponMessage}</span> : <span className="text-sage-700">Coupon {cart.coupon.toUpperCase()} applied.</span>}{' '}
            <button className="underline" onClick={() => { cartActions.setCoupon(''); setCode(''); }}>Remove</button>
          </p>
        )}
        {quote ? <OrderSummary totals={quote.totals} loading={loading} /> : <p className="text-sm text-muted">Calculating…</p>}
        <Link href="/checkout" aria-disabled={!quote || quote.issues.length > 0} className={`btn btn-primary w-full ${!quote || quote.issues.length ? 'pointer-events-none opacity-50' : ''}`}>Proceed to checkout</Link>
      </aside>
    </div>
  );
}
