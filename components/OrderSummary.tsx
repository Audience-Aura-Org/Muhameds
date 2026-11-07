import { formatMoney } from '@/lib/money';
import type { Totals } from '@/lib/pricing';

export default function OrderSummary({ totals, loading }: { totals: Totals; loading?: boolean }) {
  return (
    <dl className={`space-y-3 text-[15px] transition-opacity ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
      <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd className="font-medium">{formatMoney(totals.subtotal)}</dd></div>
      {totals.discount > 0 && <div className="flex justify-between text-brand-700"><dt>Coupon: {totals.coupon}</dt><dd>-{formatMoney(totals.discount)}</dd></div>}
      <div className="flex justify-between"><dt className="text-ink-soft">Shipping</dt><dd className="font-medium">{totals.shipping ? `Flat rate: ${formatMoney(totals.shipping)}` : 'Free shipping'}</dd></div>
      {totals.freeShippingRemaining > 0 && (
        <div className="rounded-2xl bg-brand-50 p-3 text-sm text-brand-700">
          Add {formatMoney(totals.freeShippingRemaining)} more for free shipping.
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card"><div className="h-full rounded-full bg-brand-700 transition-[width] duration-500" style={{ width: `${Math.round((100 * (totals.subtotal - totals.discount)) / (totals.subtotal - totals.discount + totals.freeShippingRemaining))}%` }} /></div>
        </div>
      )}
      <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>Total</dt><dd>{formatMoney(totals.total)}</dd></div>
    </dl>
  );
}
