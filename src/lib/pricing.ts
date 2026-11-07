import type { Cents, Coupon, Site } from './types';

export const MAX_QTY = 99;

export interface PricedLine {
  slug: string;
  variationId: number | null;
  name: string;
  option: string | null;
  image: string;
  qty: number;
  unitPrice: Cents;
  lineTotal: Cents;
}

export interface Totals {
  subtotal: Cents;
  discount: Cents;
  coupon: string | null;
  shipping: Cents;
  total: Cents;
  freeShippingRemaining: Cents;
}

/** Single source of truth for order math (used by the quote API, the order API and the UI). */
export function computeTotals(lines: { lineTotal: Cents }[], shipping: Site['shipping'], coupon: Coupon | null): Totals {
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const discount = coupon ? Math.round((subtotal * coupon.percent) / 100) : 0;
  const afterDiscount = subtotal - discount;
  const free = afterDiscount >= shipping.freeOver;
  const ship = lines.length === 0 || free ? 0 : shipping.flatRate;
  return {
    subtotal,
    discount,
    coupon: coupon ? coupon.code : null,
    shipping: ship,
    total: afterDiscount + ship,
    freeShippingRemaining: free ? 0 : Math.max(0, shipping.freeOver - afterDiscount),
  };
}
