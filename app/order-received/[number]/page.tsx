import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findOrderByToken, paymentInstructions, paymentLabel, STATUS_LABEL } from '@/lib/orders';
import { formatMoney } from '@/lib/money';
import OrderSummary from '@/components/OrderSummary';
import { IconCheck } from '@/components/Icons';

export const metadata: Metadata = { title: 'Order received', robots: { index: false } };
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ number: string }>; searchParams: Promise<{ key?: string }> };

export default async function OrderReceived({ params, searchParams }: Props) {
  const { number } = await params;
  const { key } = await searchParams;
  if (!key || !/^[a-f0-9]{32}$/.test(key)) notFound();
  const o = await findOrderByToken(decodeURIComponent(number), key);
  if (!o) notFound();
  const s = o.shipping;
  return (
    <div className="container-x max-w-3xl pt-12">
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-700 text-white"><IconCheck width={32} height={32} /></span>
        <h1 className="h-display mt-6 text-4xl">Thank you. Your order has been received.</h1>
        <p className="mt-3 text-ink-soft">A confirmation was sent to <strong>{o.email}</strong>.</p>
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-4 surface p-6 text-sm sm:grid-cols-4">
        <div><dt className="text-muted">Order number</dt><dd className="font-semibold">{o.number}</dd></div>
        <div><dt className="text-muted">Date</dt><dd className="font-semibold">{new Date(o.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</dd></div>
        <div><dt className="text-muted">Total</dt><dd className="font-semibold">{formatMoney(o.totals.total)}</dd></div>
        <div><dt className="text-muted">Status</dt><dd className="font-semibold">{STATUS_LABEL[o.status]}</dd></div>
      </dl>

      <section className="mt-6 rounded-3xl bg-ink p-6 text-white sm:p-8" aria-labelledby="pay">
        <h2 id="pay" className="font-display text-2xl font-bold">Payment: {paymentLabel(o.paymentMethod)}</h2>
        <p className="mt-2 text-white/80">{paymentInstructions(o.paymentMethod, o.number)}</p>
      </section>

      <section className="mt-6 surface p-6 sm:p-8" aria-labelledby="details">
        <h2 id="details" className="h-display mb-4 text-2xl">Order details</h2>
        <ul className="mb-6 divide-y divide-line">
          {o.lines.map((l) => (
            <li key={`${l.slug}-${l.variationId}`} className="flex justify-between gap-4 py-3 text-[15px]">
              <span><Link href={`/product/${l.slug}`} className="font-medium hover:underline">{l.name}</Link>{l.option && <span className="text-muted"> · {l.option}</span>} <span className="text-muted">× {l.qty}</span></span>
              <span className="font-semibold">{formatMoney(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <OrderSummary totals={{ ...o.totals, freeShippingRemaining: 0 }} />
        <h3 className="mt-8 font-semibold">Shipping address</h3>
        <address className="mt-2 not-italic text-ink-soft">
          {s.firstName} {s.lastName}<br />{s.company && <>{s.company}<br /></>}{s.address1}{s.address2 && `, ${s.address2}`}<br />{s.city}, {s.state} {s.zip}<br />{s.country}<br />{s.phone}
        </address>
      </section>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn btn-primary">Continue shopping</Link>
        <Link href="/order-tracking" className="btn btn-ghost">Track your order</Link>
      </div>
    </div>
  );
}
