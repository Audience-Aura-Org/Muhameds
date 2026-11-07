'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartCount, useWishlist } from '@/lib/client-store';
import { IconBag, IconHeart, IconStore, IconTruck } from './Icons';

export default function MobileTabBar() {
  const path = usePathname();
  const count = useCartCount();
  const wish = useWishlist().slugs.length;
  const items = [
    { href: '/shop', label: 'Shop', icon: IconStore },
    { href: '/wishlist', label: 'Wishlist', icon: IconHeart, n: wish },
    { href: '/cart', label: 'Cart', icon: IconBag, n: count },
    { href: '/order-tracking', label: 'Track order', icon: IconTruck },
  ];
  // checkout needs the space; product pages show their own sticky buy bar instead
  if (path.startsWith('/checkout') || path.startsWith('/product/')) return null;
  return (
    <nav aria-label="Quick links" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/[0.97] pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, icon: Icon, n }) => (
          <li key={href}>
            <Link href={href} className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${path.startsWith(href) ? "text-ink" : "text-muted"}`}>
              <Icon width={22} height={22} />
              {label}
              {!!n && <span className="absolute left-1/2 top-1 ml-2 grid h-4 min-w-4 place-items-center rounded-full bg-lime px-1 text-[10px] font-bold tabular-nums text-ink">{n}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
