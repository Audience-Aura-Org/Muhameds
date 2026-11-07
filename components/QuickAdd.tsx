'use client';
import IntentLink from '@/components/IntentLink';
import { useEffect, useRef, useState } from 'react';
import { cartActions } from '@/lib/client-store';
import type { CartLine } from '@/lib/types';
import { IconArrowRight, IconCheck, IconPlus } from './Icons';

type Props = { line: Omit<CartLine, 'qty'>; variable: boolean; href: string; name: string; disabled?: boolean };

const shell =
  'group/qa inline-flex h-11 min-w-11 items-center justify-center rounded-full px-[13px] text-[13px] sm:h-10 sm:min-w-10 sm:px-[11px] font-semibold shadow-soft transition-all duration-300 ease-out-soft active:scale-95';
/** Label collapses to an icon on touch, and expands on card hover / keyboard focus with a mouse. */
const label =
  'max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-out-soft can-hover:group-hover:ml-1.5 can-hover:group-hover:mr-1 can-hover:group-hover:max-w-28 can-hover:group-hover:opacity-100 group-focus-visible/qa:ml-1.5 group-focus-visible/qa:mr-1 group-focus-visible/qa:max-w-28 group-focus-visible/qa:opacity-100';

/** One-tap add for simple products; variable products link to the product page to pick an option. */
export default function QuickAdd({ line, variable, href, name, disabled }: Props) {
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  if (variable) {
    return (
      <IntentLink href={href} aria-label={`Choose options for ${name}`} className={`${shell} bg-card text-ink hover:bg-ink hover:text-white`}>
        <IconArrowRight width={18} height={18} />
        <span className={label} aria-hidden>Options</span>
      </IntentLink>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-label={disabled ? `${name} is sold out` : `Add ${name} to cart`}
        className={`${shell} ${added ? 'bg-brand-700 text-white' : 'bg-ink text-white hover:bg-brand-900'} disabled:pointer-events-none disabled:opacity-40`}
        onClick={() => {
          cartActions.add({ ...line, qty: 1 });
          setAdded(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setAdded(false), 1600);
        }}
      >
        {added ? <IconCheck width={18} height={18} /> : <IconPlus width={18} height={18} />}
        <span className={label} aria-hidden>{added ? 'Added' : 'Add to cart'}</span>
      </button>
      <span className="sr-only" role="status">{added ? `${name} added to cart` : ''}</span>
    </>
  );
}
