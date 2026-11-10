import type { Metadata } from 'next';
import CartView from './CartView';

export const metadata: Metadata = { title: 'Cart', robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-x pt-8 sm:pt-12">
      <h1 className="h-display mb-6 text-center text-[34px] sm:mb-10 sm:text-left leading-[1.05] sm:text-[56px]">Cart</h1>
      <CartView />
    </div>
  );
}
