import 'server-only';
import crypto from 'node:crypto';
import { z } from 'zod';
import { getProduct, site } from './catalog';
import { computeTotals, MAX_QTY, type PricedLine, type Totals } from './pricing';
import { append, find, some } from './store';
import type { Coupon } from './types';

export const cartLineInput = z.object({
  slug: z.string().min(1).max(200),
  variationId: z.number().int().nullable(),
  qty: z.number().int().min(1).max(MAX_QTY),
});

export const quoteInput = z.object({
  lines: z.array(cartLineInput).max(100),
  coupon: z.string().trim().max(40).optional().default(''),
  email: z.string().trim().max(200).optional().default(''),
});

const address = z.object({
  firstName: z.string().trim().min(1, 'Required').max(80),
  lastName: z.string().trim().min(1, 'Required').max(80),
  company: z.string().trim().max(120).optional().default(''),
  country: z.string().trim().min(2).max(2),
  address1: z.string().trim().min(3, 'Required').max(200),
  address2: z.string().trim().max(200).optional().default(''),
  city: z.string().trim().min(1, 'Required').max(100),
  state: z.string().trim().min(1, 'Required').max(100),
  zip: z.string().trim().min(3, 'Required').max(20),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(30),
});

export const orderInput = quoteInput.extend({
  email: z.string().trim().email('Enter a valid email address').max(200),
  billing: address,
  shipToDifferent: z.boolean().default(false),
  shipping: address.partial().optional(),
  paymentMethod: z.string().refine((id) => site.paymentMethods.some((m) => m.id === id), 'Choose a payment method'),
  notes: z.string().trim().max(2000).optional().default(''),
  website: z.string().max(0, 'Spam detected').optional().default(''), // honeypot
});

export type OrderInput = z.infer<typeof orderInput>;

export interface Order {
  number: string;
  token: string;
  createdAt: string;
  status: 'pending-payment' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  email: string;
  billing: OrderInput['billing'];
  shipping: OrderInput['billing'];
  paymentMethod: string;
  notes: string;
  lines: PricedLine[];
  totals: Totals;
}

export class QuoteError extends Error {
  constructor(public issues: string[]) { super(issues.join('; ')); }
}

/** Re-price cart lines from the catalog; client prices are never trusted. */
export function priceLines(lines: z.infer<typeof cartLineInput>[]) {
  const issues: string[] = [];
  const priced: PricedLine[] = [];
  for (const l of lines) {
    const p = getProduct(l.slug);
    if (!p) { issues.push(`A product in your cart is no longer available (${l.slug}).`); continue; }
    let unit = p.price, option: string | null = null, image = p.images[0] ?? '', inStock = p.inStock;
    if (p.variations.length) {
      const v = p.variations.find((x) => x.id === l.variationId);
      if (!v) { issues.push(`Please choose a ${p.attribute?.label ?? 'option'} for ${p.name}.`); continue; }
      unit = v.price; option = `${p.attribute?.label ?? 'Option'}: ${v.value}`; image = v.image ?? image; inStock = v.inStock;
    }
    if (!inStock) { issues.push(`${p.name} is out of stock.`); continue; }
    priced.push({ slug: p.slug, variationId: l.variationId, name: p.name, option, image, qty: l.qty, unitPrice: unit, lineTotal: unit * l.qty });
  }
  return { priced, issues };
}

/** Resolve a coupon code; returns a message when it can't be applied. */
export async function resolveCoupon(code: string, email: string): Promise<{ coupon: Coupon | null; message: string | null }> {
  if (!code) return { coupon: null, message: null };
  const c = site.coupons.find((x) => x.code.toLowerCase() === code.toLowerCase());
  if (!c) return { coupon: null, message: `Coupon "${code}" does not exist.` };
  if (c.firstOrderOnly && email) {
    const used = await some<Order>('orders', (o) => o.email.toLowerCase() === email.toLowerCase() && o.status !== 'cancelled');
    if (used) return { coupon: null, message: `Coupon "${c.code}" is only valid on your first order.` };
  }
  return { coupon: c, message: null };
}

export async function quote(input: z.infer<typeof quoteInput>) {
  const { priced, issues } = priceLines(input.lines);
  const { coupon, message } = await resolveCoupon(input.coupon, input.email);
  return { lines: priced, totals: computeTotals(priced, site.shipping, coupon), issues, couponMessage: message };
}

function orderNumber() {
  // human-friendly, non-sequential: MM-YYMMDD-XXXX
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  return `MM-${ymd}-${crypto.randomInt(1000, 9999)}`;
}

export async function createOrder(input: OrderInput): Promise<Order> {
  const { lines, totals, issues, couponMessage } = await quote(input);
  if (issues.length) throw new QuoteError(issues);
  if (couponMessage) throw new QuoteError([couponMessage]);
  if (!lines.length) throw new QuoteError(['Your cart is empty.']);
  const shipping = input.shipToDifferent ? { ...input.billing, ...input.shipping } as OrderInput['billing'] : input.billing;
  const order: Order = {
    number: orderNumber(),
    token: crypto.randomBytes(16).toString('hex'),
    createdAt: new Date().toISOString(),
    status: 'pending-payment',
    email: input.email,
    billing: input.billing,
    shipping,
    paymentMethod: input.paymentMethod,
    notes: input.notes,
    lines,
    totals,
  };
  await append('orders', order);
  return order;
}

export function findOrderByToken(number: string, token: string) {
  return find<Order>('orders', (o) => o.number === number && crypto.timingSafeEqual(Buffer.from(o.token.padEnd(64)), Buffer.from(token.padEnd(64).slice(0, 64))));
}

export function findOrderByEmail(number: string, email: string) {
  return find<Order>('orders', (o) => o.number.toLowerCase() === number.trim().toLowerCase() && o.email.toLowerCase() === email.trim().toLowerCase());
}

export const STATUS_LABEL: Record<Order['status'], string> = {
  'pending-payment': 'Awaiting payment',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function paymentLabel(id: string) {
  return site.paymentMethods.find((m) => m.id === id)?.label ?? id;
}

export function paymentInstructions(id: string, number: string) {
  const m = site.paymentMethods.find((x) => x.id === id);
  return m?.instructions?.replace('{order}', number)
    ?? `We'll email you the ${m?.label ?? 'payment'} details shortly. Please include your order number ${number} in the payment note. Your order ships once payment is confirmed.`;
}
