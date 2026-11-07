import type { Metadata } from 'next';
import CartView from './CartView';

export const metadata: Metadata = { title: 'Cart', robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-x pt-8 sm:pt-12">
      <h1 className="h-display mb-8 text-4xl sm:text-5xl">Cart</h1>
      <CartView />
    </div>
  );
}
