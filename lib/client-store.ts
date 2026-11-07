'use client';
import { useSyncExternalStore } from 'react';
import type { CartLine } from './types';
import { MAX_QTY } from './pricing';

/** Tiny localStorage-backed store with cross-tab sync. */
function createStore<T>(key: string, initial: T) {
  let state: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();
  const load = () => {
    if (loaded || typeof window === 'undefined') return;
    loaded = true;
    try { const raw = localStorage.getItem(key); if (raw) state = JSON.parse(raw) as T; } catch { /* private mode / corrupt */ }
  };
  const emit = () => listeners.forEach((l) => l());
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key !== key) return;
      try { state = e.newValue ? JSON.parse(e.newValue) : initial; } catch { state = initial; }
      emit();
    });
  }
  return {
    get: () => { load(); return state; },
    set(next: T) {
      state = next;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* storage full/blocked: keep in memory */ }
      emit();
    },
    subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },
    initial,
  };
}

const cart = createStore<{ lines: CartLine[]; coupon: string }>('mm-cart-v1', { lines: [], coupon: '' });
const wishlist = createStore<{ slugs: string[] }>('mm-wishlist-v1', { slugs: [] });

const sameLine = (a: Pick<CartLine, 'slug' | 'variationId'>, b: Pick<CartLine, 'slug' | 'variationId'>) => a.slug === b.slug && a.variationId === b.variationId;

export const cartActions = {
  add(line: CartLine) {
    const s = cart.get();
    const existing = s.lines.find((l) => sameLine(l, line));
    const lines = existing
      ? s.lines.map((l) => (sameLine(l, line) ? { ...l, ...line, qty: Math.min(MAX_QTY, l.qty + line.qty) } : l))
      : [...s.lines, { ...line, qty: Math.min(MAX_QTY, line.qty) }];
    cart.set({ ...s, lines });
  },
  setQty(slug: string, variationId: number | null, qty: number) {
    const s = cart.get();
    const lines = qty <= 0
      ? s.lines.filter((l) => !sameLine(l, { slug, variationId }))
      : s.lines.map((l) => (sameLine(l, { slug, variationId }) ? { ...l, qty: Math.min(MAX_QTY, qty) } : l));
    cart.set({ ...s, lines });
  },
  remove(slug: string, variationId: number | null) { cartActions.setQty(slug, variationId, 0); },
  setCoupon(coupon: string) { cart.set({ ...cart.get(), coupon }); },
  /** Sync display snapshots with authoritative server prices. */
  reprice(priced: { slug: string; variationId: number | null; unitPrice: number; name: string; image: string }[]) {
    const s = cart.get();
    cart.set({ ...s, lines: s.lines.map((l) => { const p = priced.find((x) => sameLine(x, l)); return p ? { ...l, unitPrice: p.unitPrice, name: p.name, image: p.image } : l; }) });
  },
  clear() { cart.set({ lines: [], coupon: '' }); },
};

export function useCart() {
  return useSyncExternalStore(cart.subscribe, cart.get, () => cart.initial);
}

export function useCartCount() {
  const c = useCart();
  return c.lines.reduce((n, l) => n + l.qty, 0);
}

export const wishlistActions = {
  toggle(slug: string) {
    const s = wishlist.get();
    wishlist.set({ slugs: s.slugs.includes(slug) ? s.slugs.filter((x) => x !== slug) : [...s.slugs, slug] });
  },
  remove(slug: string) { wishlist.set({ slugs: wishlist.get().slugs.filter((x) => x !== slug) }); },
};

export function useWishlist() {
  return useSyncExternalStore(wishlist.subscribe, wishlist.get, () => wishlist.initial);
}
