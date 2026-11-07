'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCartCount, useWishlist } from '@/lib/client-store';
import type { NavItem } from '@/lib/types';
import { IconBag, IconChevronDown, IconClose, IconHeart, IconMenu, IconSearch } from './Icons';

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
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenuOpen(false); setSearchOpen(false); } };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [menuOpen]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0]));

  function submitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q')?.toString().trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  }

  return (
    <>
      <div className="bg-ink text-center text-[13px] font-medium tracking-wide text-white">
        {/* the old site also used a shorter variant on mobile */}
        <p className="container-x hidden py-2 sm:block">{promo}</p>
        <p className="container-x py-2 sm:hidden">{promo.replace(/^First purchase with a /i, '')}</p>
      </div>
      <header className={`sticky top-0 z-40 border-b transition-colors ${scrolled ? 'border-line bg-paper/90 backdrop-blur-md' : 'border-transparent bg-paper'}`}>
        <div className="container-x flex h-16 items-center gap-4 lg:h-20">
          <button className="-ml-2 rounded-full p-2 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}><IconMenu /></button>
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={`${name} home`}>
            <Image src={logo} alt="" width={44} height={44} className="h-10 w-10 object-contain lg:h-11 lg:w-11" priority />
            <span className="hidden font-display text-lg font-semibold tracking-tight sm:inline">{name}</span>
          </Link>

          <nav aria-label="Main" className="mx-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.label} className="group relative">
                  <Link href={item.href} className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white ${isActive(item.href) ? 'text-sage-700' : 'text-ink'}`}>
                    {item.label}
                    {item.children.length > 0 && <IconChevronDown width={14} height={14} />}
                  </Link>
                  {item.children.length > 0 && (
                    <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      <ul className="min-w-56 rounded-2xl border border-line bg-white p-2 shadow-xl shadow-ink/5">
                        {item.children.map((c) => (
                          <li key={c.label}><Link href={c.href} className="block rounded-xl px-4 py-2.5 text-sm hover:bg-sage-50">{c.label}</Link></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <button className="rounded-full p-2.5 hover:bg-white" onClick={() => setSearchOpen((v) => !v)} aria-label="Search products" aria-expanded={searchOpen}><IconSearch /></button>
            <Link href="/wishlist" className="relative hidden rounded-full p-2.5 hover:bg-white sm:block" aria-label={`Wishlist, ${wish} items`}>
              <IconHeart />
              {wish > 0 && <Badge n={wish} />}
            </Link>
            <Link href="/cart" className="relative rounded-full bg-ink p-2.5 text-white hover:bg-ink-soft" aria-label={`Cart, ${count} items`}>
              <IconBag />
              {count > 0 && <Badge n={count} light />}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-line bg-paper">
            <form role="search" onSubmit={submitSearch} className="container-x flex gap-2 py-3">
              <label htmlFor="site-search" className="sr-only">Search products</label>
              <input ref={searchRef} id="site-search" name="q" type="search" placeholder="Search for products" className="field" autoComplete="off" />
              <button className="btn btn-primary">Search</button>
            </form>
          </div>
        )}
      </header>

      {/* mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${menuOpen ? '' : 'pointer-events-none'}`} aria-hidden={!menuOpen}>
        <div className={`absolute inset-0 bg-ink/40 transition-opacity ${menuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMenuOpen(false)} />
        <nav aria-label="Mobile" className={`absolute inset-y-0 left-0 flex w-[min(85vw,360px)] flex-col bg-paper shadow-2xl transition-transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between border-b border-line p-4">
            <span className="font-display text-lg font-semibold">{name}</span>
            <button className="rounded-full p-2" onClick={() => setMenuOpen(false)} aria-label="Close menu" tabIndex={menuOpen ? 0 : -1}><IconClose /></button>
          </div>
          <ul className="flex-1 overflow-y-auto p-2">
            {nav.map((item) => (
              <li key={item.label}>
                <Link href={item.href} tabIndex={menuOpen ? 0 : -1} className="block rounded-xl px-4 py-3 font-medium hover:bg-white">{item.label}</Link>
                {item.children.length > 0 && (
                  <ul className="mb-2 ml-4 border-l border-line pl-2">
                    {item.children.map((c) => <li key={c.label}><Link href={c.href} tabIndex={menuOpen ? 0 : -1} className="block rounded-xl px-4 py-2.5 text-sm text-ink-soft hover:bg-white">{c.label}</Link></li>)}
                  </ul>
                )}
              </li>
            ))}
            <li><Link href="/wishlist" tabIndex={menuOpen ? 0 : -1} className="block rounded-xl px-4 py-3 font-medium hover:bg-white">Wishlist</Link></li>
            <li><Link href="/contact-us" tabIndex={menuOpen ? 0 : -1} className="block rounded-xl px-4 py-3 font-medium hover:bg-white">Contact Us</Link></li>
          </ul>
        </nav>
      </div>
    </>
  );
}

function Badge({ n, light }: { n: number; light?: boolean }) {
  return (
    <span className={`absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold ${light ? 'bg-gold text-ink' : 'bg-sage-700 text-white'}`}>
      {n > 99 ? '99+' : n}
    </span>
  );
}
