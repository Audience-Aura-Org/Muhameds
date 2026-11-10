import type { Metadata } from 'next';
import { site } from '@/lib/catalog';
import CheckoutForm from './CheckoutForm';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-x pt-8 sm:pt-12">
      <h1 className="h-display mb-6 text-center text-[34px] sm:mb-10 sm:text-left leading-[1.05] sm:text-[56px]">Checkout</h1>
      <CheckoutForm paymentMethods={site.paymentMethods} />
    </div>
  );
}
