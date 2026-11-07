'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCartCount, useWishlist } from '@/lib/client-store';
import type { NavItem } from '@/lib/types';
import { IconBag, IconChevronDown, IconHeart, IconMenu, IconSearch } from './Icons';
import MobileMenu from './MobileMenu';

/** Splits "…use promo code: CODE" so the code can be highlighted. */
function PromoText({ text }: { text: string }) {
  const m = text.match(/^(.*?:\s*)([A-Z0-9-]{3,})\s*$/);
  if (!m) return <>{text}</>;
  return <>{m[1]}<span className="ml-1 rounded-md bg-lime px-1.5 py-0.5 font-mono text-[12px] font-bold tracking-wider text-ink">{m[2]}</span></>;
}

export default function Header({ nav, promo, logo, name }: { nav: NavItem[]; promo: string; logo: string; name: string }) {
  const count = useCartCount();
  const wish = useWishlist().slugs.length;
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenuOpen(false); setSearchOpen(false); } };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0]));

  function submitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q')?.toString().trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  }

  return (
    <>
      <div className="bg-ink text-center text-[13px] font-medium text-white/90">
        <p className="container-x hidden py-2.5 sm:block"><PromoText text={promo} /></p>
        <p className="container-x py-2.5 sm:hidden"><PromoText text={promo.replace(/^First purchase with a /i, '')} /></p>
      </div>

      <header className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 ${scrolled ? 'border-line bg-paper/95 shadow-soft lg:bg-paper/85 lg:backdrop-blur-xl lg:backdrop-saturate-150' : 'border-transparent bg-paper'}`}>
        <div className="container-x flex h-16 items-center gap-3 lg:h-[76px] lg:gap-8">
          <button ref={menuButtonRef} className="btn-icon -ml-2 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen} aria-controls="mobile-nav"><IconMenu /></button>

          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${name} home`}>
            <Image src={logo} alt="" width={44} height={44} className="h-10 w-10 object-contain" priority />
            <span className="hidden font-display text-[19px] font-bold tracking-tight sm:inline lg:hidden xl:inline">{name}</span>
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center">
              {nav.map((item) => (
                <li key={item.label} className="group relative">
                  <Link href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}
                    className="relative flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium xl:px-3.5 text-ink-soft transition hover:text-ink aria-[current=page]:text-ink">
                    {item.label}
                    {item.children.length > 0 && <IconChevronDown width={14} height={14} className="transition group-hover:rotate-180" />}
                    {isActive(item.href) && <span className="absolute inset-x-3 -bottom-px xl:inset-x-3.5 h-0.5 rounded-full bg-brand" aria-hidden />}
                  </Link>
                  {item.children.length > 0 && (
                    <div className="invisible absolute left-0 top-full translate-y-1 pt-3 opacity-0 transition duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <ul className="min-w-60 rounded-2xl border border-line bg-card p-1.5 shadow-lift">
                        {item.children.map((c) => (
                          <li key={c.label}><Link href={c.href} className="block rounded-xl px-3.5 py-2.5 text-sm text-ink-soft transition hover:bg-paper hover:text-ink">{c.label}</Link></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            {/* desktop: inline search */}
            <form role="search" onSubmit={submitSearch} className="relative mr-2 hidden xl:block">
              <label htmlFor="header-search" className="sr-only">Search products</label>
              <IconSearch width={18} height={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input id="header-search" name="q" type="search" placeholder="Search products…" autoComplete="off"
                className="h-10 w-44 rounded-full border border-line bg-card pl-10 pr-4 text-sm outline-none transition-[width,border-color,box-shadow] placeholder:text-muted focus:border-brand-700 focus:ring-4 focus:ring-brand/15 2xl:w-60 2xl:focus:w-72" />
            </form>
            <button className="btn-icon xl:hidden" onClick={() => setSearchOpen((v) => !v)} aria-label="Search products" aria-expanded={searchOpen} aria-controls="search-panel"><IconSearch /></button>
            <Link href="/wishlist" className="btn-icon relative hidden sm:grid" aria-label={`Wishlist, ${wish} items`}>
              <IconHeart />
              {wish > 0 && <Badge n={wish} />}
            </Link>
            <Link href="/cart" className="relative ml-1 inline-flex h-10 items-center gap-2 rounded-full bg-ink pl-3 pr-3 text-sm font-semibold text-white transition hover:bg-brand-900 sm:pr-4" aria-label={`Cart, ${count} items`}>
              <IconBag width={20} height={20} />
              <span className="hidden sm:inline" aria-hidden>Cart</span>
              {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-lime px-1 text-[11px] font-bold tabular-nums text-ink" aria-hidden>{count > 99 ? '99+' : count}</span>}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div id="search-panel" className="animate-fade-up border-t border-line bg-paper xl:hidden">
            <form role="search" onSubmit={submitSearch} className="container-x flex gap-2 py-3">
              <label htmlFor="site-search" className="sr-only">Search products</label>
              <input ref={searchRef} id="site-search" name="q" type="search" placeholder="Search for products" className="field" autoComplete="off" />
              <button className="btn btn-primary h-12">Search</button>
            </form>
          </div>
        )}
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} nav={nav} logo={logo} name={name} pathname={pathname}
        cartCount={count} wishCount={wish} onSearch={submitSearch} returnFocusTo={menuButtonRef} />
    </>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-700 px-1 text-[10px] font-bold tabular-nums text-white" aria-hidden>
      {n > 99 ? '99+' : n}
    </span>
  );
}
