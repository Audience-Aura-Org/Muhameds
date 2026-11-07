'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import type { NavItem } from '@/lib/types';
import { IconBag, IconChevronDown, IconClose, IconHeart, IconSearch, IconTruck } from './Icons';

type Props = {
  open: boolean;
  onClose: () => void;
  nav: NavItem[];
  logo: string;
  name: string;
  pathname: string;
  cartCount: number;
  wishCount: number;
  onSearch: (e: React.FormEvent<HTMLFormElement>) => void;
  /** element to give focus back to when the menu closes (the hamburger button) */
  returnFocusTo: React.RefObject<HTMLElement | null>;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Off-canvas navigation for < lg screens: modal dialog with focus trap and scroll lock. */
export default function MobileMenu({ open, onClose, nav, logo, name, pathname, cartCount, wishCount, onSearch, returnFocusTo }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const uid = useId();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : !href.includes('?') && pathname.startsWith(href));

  // sub-menus start expanded only when the shopper is inside them
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    if (open) setExpanded(nav.find((n) => n.children.some((c) => isActive(c.href)) || (n.children.length > 0 && isActive(n.href)))?.label ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Scroll lock on <html>: iOS Safari ignores overflow:hidden on <body>.
  // Focus: move into the dialog on open, give it back to the opener on close.
  const wasOpen = useRef(false);
  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      root.classList.add('menu-open');
      closeRef.current?.focus({ preventScroll: true });
    } else if (wasOpen.current) {
      returnFocusTo.current?.focus({ preventScroll: true });
    }
    wasOpen.current = open;
    return () => root.classList.remove('menu-open');
  }, [open, returnFocusTo]);

  // keep Tab inside the dialog
  function trapTab(e: React.KeyboardEvent) {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const els = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // Close on any link tap. Relying on the pathname changing misses links that only change
  // the query string (e.g. /shop -> /shop?q=cartridge), which left the menu open.
  function closeOnLink(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('a[href]')) onClose();
  }

  const row = 'flex min-h-12 items-center rounded-xl px-3 text-[17px] font-medium transition active:bg-card aria-[current=page]:text-brand-700';

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open} inert={!open}>
      <div className={`absolute inset-0 bg-ink/60 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div
        ref={panelRef}
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        onKeyDown={trapTab}
        onClick={closeOnLink}
        className={`absolute inset-y-0 left-0 flex w-[min(88vw,380px)] flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out-soft ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line py-2 pl-4 pr-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <Link href="/" className="flex min-w-0 items-center gap-2 font-display text-lg font-bold">
            <Image src={logo} alt="" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" />
            <span className="truncate">{name}</span>
          </Link>
          <button ref={closeRef} type="button" className="btn-icon" onClick={onClose} aria-label="Close menu"><IconClose /></button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <form role="search" onSubmit={(e) => { onSearch(e); onClose(); }} className="px-4 pt-4">
            <label htmlFor={`${uid}-q`} className="sr-only">Search products</label>
            <div className="relative">
              <IconSearch width={18} height={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input id={`${uid}-q`} name="q" type="search" enterKeyHint="search" placeholder="Search products…" autoComplete="off" className="field rounded-full pl-11" />
            </div>
          </form>

          <nav aria-label="Mobile">
            <ul className="px-2 py-3">
              {nav.map((item) => {
                const hasKids = item.children.length > 0;
                const isOpen = expanded === item.label;
                const subId = `${uid}-${item.label.replace(/\W+/g, '-')}`;
                return (
                  <li key={item.label}>
                    <div className="flex items-center">
                      <Link href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} className={`${row} flex-1`}>{item.label}</Link>
                      {hasKids && (
                        <button type="button" className="btn-icon text-ink-soft" aria-expanded={isOpen} aria-controls={subId}
                          aria-label={`${isOpen ? 'Hide' : 'Show'} ${item.label} categories`}
                          onClick={() => setExpanded(isOpen ? null : item.label)}>
                          <IconChevronDown width={20} height={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                    {hasKids && (
                      <div className={`grid transition-[grid-template-rows] duration-300 ease-out-soft ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                        <div id={subId} className="overflow-hidden" inert={!isOpen}>
                          <ul className="ml-4 border-l border-line py-1 pl-2">
                            {item.children.map((c) => (
                              <li key={c.label}>
                                <Link href={c.href} aria-current={isActive(c.href) ? 'page' : undefined}
                                  className="flex min-h-11 items-center rounded-xl px-3 text-[15px] text-ink-soft transition active:bg-card aria-[current=page]:font-medium aria-[current=page]:text-brand-700">{c.label}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="space-y-2 border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Link href="/cart" className="btn btn-primary w-full justify-between px-5">
            <span className="flex items-center gap-2"><IconBag width={18} height={18} />Cart</span>
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-lime px-1.5 text-xs font-bold tabular-nums text-ink">{cartCount}</span>
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/wishlist" className="btn btn-ghost px-3"><IconHeart width={17} height={17} />Wishlist{wishCount > 0 ? ` (${wishCount})` : ''}</Link>
            <Link href="/order-tracking" className="btn btn-ghost px-3"><IconTruck width={17} height={17} />Track order</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
