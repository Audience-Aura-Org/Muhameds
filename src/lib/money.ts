import type { Cents } from './types';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatMoney(cents: Cents): string {
  return fmt.format(cents / 100);
}

export function percentOff(price: Cents, regular: Cents | null): number | null {
  if (!regular || regular <= price) return null;
  return Math.round(((regular - price) / regular) * 100);
}
