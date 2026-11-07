import { NextResponse } from 'next/server';
import { createOrder, orderInput, paymentInstructions, paymentLabel, QuoteError } from '@/lib/orders';
import { sendMail, storeInbox } from '@/lib/mail';
import { formatMoney } from '@/lib/money';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const tooMany = () => NextResponse.json({ error: 'Too many orders from this connection. Please wait a few minutes or contact us.' }, { status: 429 });
  // Generous cap on attempts (typos must not lock real customers out)…
  if (!(await rateLimit('order-attempt', 30, 10 * 60_000))) return tooMany();
  const parsed = orderInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[i.path.join('.')] ??= i.message;
    return NextResponse.json({ error: 'Please check the highlighted fields.', fieldErrors }, { status: 400 });
  }
  // …and a strict cap on orders actually placed.
  if (!(await rateLimit('order', 5, 10 * 60_000))) return tooMany();
  try {
    const order = await createOrder(parsed.data);
    const summary = [
      ...order.lines.map((l) => `${l.qty} × ${l.name}${l.option ? ` (${l.option})` : ''} — ${formatMoney(l.lineTotal)}`),
      `Subtotal: ${formatMoney(order.totals.subtotal)}`,
      ...(order.totals.discount ? [`Discount (${order.totals.coupon}): -${formatMoney(order.totals.discount)}`] : []),
      `Shipping: ${order.totals.shipping ? formatMoney(order.totals.shipping) : 'Free'}`,
      `Total: ${formatMoney(order.totals.total)}`,
      `Payment: ${paymentLabel(order.paymentMethod)}`,
    ].join('\n');
    const ship = order.shipping;
    const addr = `${ship.firstName} ${ship.lastName}\n${ship.address1}${ship.address2 ? ', ' + ship.address2 : ''}\n${ship.city}, ${ship.state} ${ship.zip}, ${ship.country}\n${ship.phone}`;
    await Promise.all([
      sendMail({
        to: order.email,
        subject: `Your Muha Meds Store order ${order.number}`,
        text: `Thanks for your order!\n\nOrder ${order.number}\n\n${summary}\n\n${paymentInstructions(order.paymentMethod, order.number)}\n\nShipping to:\n${addr}`,
      }),
      sendMail({
        to: storeInbox(),
        replyTo: order.email,
        subject: `New order ${order.number} — ${formatMoney(order.totals.total)} (${paymentLabel(order.paymentMethod)})`,
        text: `${summary}\n\nCustomer: ${order.email}\nShip to:\n${addr}\n\nNotes: ${order.notes || '-'}`,
      }),
    ]);
    return NextResponse.json({ number: order.number, token: order.token });
  } catch (e) {
    if (e instanceof QuoteError) return NextResponse.json({ error: e.issues.join(' ') }, { status: 409 });
    console.error('[orders] failed', e);
    return NextResponse.json({ error: 'We could not place your order. Please try again or contact us.' }, { status: 500 });
  }
}
