import type { Metadata } from 'next';
import { site } from '@/lib/catalog';
import CheckoutForm from './CheckoutForm';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-x pt-8 sm:pt-12">
      <h1 className="h-display mb-8 text-4xl sm:text-5xl">Checkout</h1>
      <CheckoutForm paymentMethods={site.paymentMethods} />
    </div>
  );
}
