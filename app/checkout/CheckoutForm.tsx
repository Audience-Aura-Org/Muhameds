'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { cartActions, useCart } from '@/lib/client-store';
import { countryOptions, US_STATES } from '@/lib/countries';
import { formatMoney } from '@/lib/money';
import { useQuote } from '@/lib/use-quote';
import type { PaymentMethod } from '@/lib/types';
import OrderSummary from '@/components/OrderSummary';

type Errors = Record<string, string>;

export default function CheckoutForm({ paymentMethods }: { paymentMethods: PaymentMethod[] }) {
  const router = useRouter();
  const cart = useCart();
  const [email, setEmail] = useState('');
  const [emailForQuote, setEmailForQuote] = useState('');
  const { quote, loading } = useQuote(cart.lines, cart.coupon, emailForQuote);
  const [shipDifferent, setShipDifferent] = useState(false);
  const [payment, setPayment] = useState(paymentMethods[0]?.id ?? '');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const countries = useMemo(() => countryOptions(), []);

  if (!cart.lines.length && !placed) {
    return (
      <div className="rounded-[2rem] border border-dashed border-line bg-white p-12 text-center">
        <p className="h-display text-2xl">Your cart is currently empty.</p>
        <Link href="/shop" className="btn btn-primary mt-6">Return to shop</Link>
      </div>
    );
  }

  function collect(prefix: string, fd: FormData) {
    const g = (k: string) => (fd.get(`${prefix}.${k}`) ?? '').toString();
    return { firstName: g('firstName'), lastName: g('lastName'), company: g('company'), country: g('country'), address1: g('address1'), address2: g('address2'), city: g('city'), state: g('state'), zip: g('zip'), phone: g('phone') };
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const fd = new FormData(e.currentTarget);
    setSubmitting(true); setErrors({}); setFormError('');
    const body = {
      lines: cart.lines.map(({ slug, variationId, qty }) => ({ slug, variationId, qty })),
      coupon: cart.coupon, email: fd.get('email'),
      billing: collect('billing', fd), shipToDifferent: shipDifferent,
      shipping: shipDifferent ? collect('shipping', fd) : undefined,
      paymentMethod: payment, notes: fd.get('notes'), website: fd.get('website'),
    };
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.fieldErrors ?? {});
        setFormError(data.error ?? 'Something went wrong. Please try again.');
        requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.focus());
        return;
      }
      setPlaced(true);
      cartActions.clear();
      router.push(`/order-received/${encodeURIComponent(data.number)}?key=${data.token}`);
    } catch {
      setFormError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const field = (name: string, label: string, opts: { type?: string; autoComplete?: string; optional?: boolean; className?: string } = {}) => (
    <div className={opts.className}>
      <label htmlFor={name} className="label">{label}{opts.optional ? <span className="font-normal text-muted"> (optional)</span> : ' *'}</label>
      <input id={name} name={name} type={opts.type ?? 'text'} autoComplete={opts.autoComplete} required={!opts.optional}
        className="field" aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-err` : undefined} />
      {errors[name] && <p id={`${name}-err`} className="mt-1 text-sm text-sale">{errors[name]}</p>}
    </div>
  );

  const addressFields = (prefix: 'billing' | 'shipping', section: string) => (
    <div className="grid gap-4 sm:grid-cols-2">
      {field(`${prefix}.firstName`, 'First name', { autoComplete: `${section} given-name` })}
      {field(`${prefix}.lastName`, 'Last name', { autoComplete: `${section} family-name` })}
      {field(`${prefix}.company`, 'Company name', { optional: true, autoComplete: `${section} organization`, className: 'sm:col-span-2' })}
      <CountryState prefix={prefix} section={section} countries={countries} errors={errors} />
      {field(`${prefix}.address1`, 'Street address', { autoComplete: `${section} address-line1`, className: 'sm:col-span-2' })}
      {field(`${prefix}.address2`, 'Apartment, suite, unit, etc.', { optional: true, autoComplete: `${section} address-line2`, className: 'sm:col-span-2' })}
      {field(`${prefix}.city`, 'Town / City', { autoComplete: `${section} address-level2` })}
      {field(`${prefix}.zip`, 'ZIP Code', { autoComplete: `${section} postal-code` })}
      {field(`${prefix}.phone`, 'Phone', { type: 'tel', autoComplete: `${section} tel`, className: 'sm:col-span-2' })}
    </div>
  );

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1fr_420px]">
      <div className="space-y-10">
        <section className="space-y-4 rounded-[2rem] border border-line bg-white p-6 sm:p-8">
          <h2 className="h-display text-2xl">Billing details</h2>
          <div>
            <label htmlFor="email" className="label">Email address *</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="field" value={email}
              onChange={(e) => setEmail(e.target.value)} onBlur={() => setEmailForQuote(email.trim())}
              aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-err' : 'email-hint'} />
            {errors.email ? <p id="email-err" className="mt-1 text-sm text-sale">{errors.email}</p> : <p id="email-hint" className="mt-1 text-xs text-muted">Order confirmation and payment details are sent here.</p>}
          </div>
          {addressFields('billing', 'billing')}
        </section>

        <section className="space-y-4 rounded-[2rem] border border-line bg-white p-6 sm:p-8">
          <label className="flex cursor-pointer items-center gap-3 font-display text-lg font-semibold">
            <input type="checkbox" checked={shipDifferent} onChange={(e) => setShipDifferent(e.target.checked)} className="h-5 w-5 accent-sage-700" />
            Ship to a different address?
          </label>
          {shipDifferent && addressFields('shipping', 'shipping')}
          <div>
            <label htmlFor="notes" className="label">Order notes <span className="font-normal text-muted">(optional)</span></label>
            <textarea id="notes" name="notes" rows={3} className="field" placeholder="Notes about your order, e.g. special notes for delivery." />
          </div>
        </section>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      </div>

      <aside className="h-fit space-y-6 rounded-[2rem] border border-line bg-white p-6 lg:sticky lg:top-28" aria-label="Your order">
        <h2 className="h-display text-2xl">Your order</h2>
        <ul className="space-y-3">
          {cart.lines.map((l) => (
            <li key={`${l.slug}-${l.variationId}`} className="flex items-center gap-3">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sage-50">
                {l.image && <Image src={l.image} alt="" fill sizes="56px" className="object-contain p-1" />}
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-bold text-white">{l.qty}</span>
              </span>
              <span className="min-w-0 flex-1 text-sm"><span className="line-clamp-2 font-medium">{l.name}</span>{l.option && <span className="text-muted">{l.option}</span>}</span>
              <span className="text-sm font-semibold">{formatMoney(l.unitPrice * l.qty)}</span>
            </li>
          ))}
        </ul>
        {quote?.couponMessage && <p className="text-sm text-sale" role="alert">{quote.couponMessage} <button type="button" className="underline" onClick={() => cartActions.setCoupon('')}>Remove coupon</button></p>}
        {quote?.issues.length ? <ul role="alert" className="space-y-1 rounded-2xl bg-sale/10 p-3 text-sm text-sale">{quote.issues.map((i) => <li key={i}>{i}</li>)}</ul> : null}
        {quote ? <OrderSummary totals={quote.totals} loading={loading} /> : <p className="text-sm text-muted">Calculating…</p>}

        <fieldset className="space-y-2">
          <legend className="label">Payment method *</legend>
          {paymentMethods.map((m) => (
            <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${payment === m.id ? 'border-ink bg-sage-50' : 'border-line hover:border-ink-soft'}`}>
              <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => setPayment(m.id)} className="h-4 w-4 accent-sage-700" />
              <span className="font-medium">{m.label}</span>
            </label>
          ))}
          <p className="text-xs text-muted">After you place the order we email you the payment details. Your order ships once payment is confirmed.</p>
          {errors.paymentMethod && <p className="text-sm text-sale">{errors.paymentMethod}</p>}
        </fieldset>

        <p className="text-xs text-muted">Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <Link href="/privacy-policy" className="underline">privacy policy</Link>.</p>
        {formError && <p role="alert" tabIndex={-1} className="rounded-2xl bg-sale/10 p-3 text-sm text-sale">{formError}</p>}
        <button className="btn btn-primary h-14 w-full text-base" disabled={submitting || !quote || quote.issues.length > 0}>
          {submitting ? 'Placing order…' : quote ? `Place order · ${formatMoney(quote.totals.total)}` : 'Place order'}
        </button>
      </aside>
    </form>
  );
}

function CountryState({ prefix, section, countries, errors }: { prefix: string; section: string; countries: { code: string; name: string }[]; errors: Errors }) {
  const [country, setCountry] = useState('US');
  const sid = `${prefix}.state`;
  return (
    <>
      <div className="sm:col-span-2">
        <label htmlFor={`${prefix}.country`} className="label">Country / Region *</label>
        <select id={`${prefix}.country`} name={`${prefix}.country`} value={country} onChange={(e) => setCountry(e.target.value)} autoComplete={`${section} country`} className="field">
          {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={sid} className="label">State *</label>
        {country === 'US' ? (
          <select id={sid} name={sid} autoComplete={`${section} address-level1`} className="field" defaultValue="" aria-invalid={!!errors[sid]} required>
            <option value="" disabled>Select a state…</option>
            {US_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
        ) : (
          <input id={sid} name={sid} autoComplete={`${section} address-level1`} className="field" aria-invalid={!!errors[sid]} required />
        )}
        {errors[sid] && <p className="mt-1 text-sm text-sale">{errors[sid]}</p>}
      </div>
    </>
  );
}
