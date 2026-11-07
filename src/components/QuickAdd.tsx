'use client';
import Link from 'next/link';
import { useState } from 'react';
import { cartActions } from '@/lib/client-store';
import type { CartLine } from '@/lib/types';
import { IconCheck, IconPlus } from './Icons';

/** One-tap add for simple products; variable products link to the product page. */
export default function QuickAdd({ line, variable, href, name }: { line: Omit<CartLine, 'qty'>; variable: boolean; href: string; name: string }) {
  const [added, setAdded] = useState(false);
  if (variable) {
    return <Link href={href} className="btn btn-ghost w-full py-2.5 text-[13px]">Select options</Link>;
  }
  return (
    <button
      type="button"
      className="btn btn-primary w-full py-2.5 text-[13px]"
      aria-label={`Add ${name} to cart`}
      onClick={() => { cartActions.add({ ...line, qty: 1 }); setAdded(true); setTimeout(() => setAdded(false), 1600); }}
    >
      {added ? <><IconCheck width={16} height={16} /> Added</> : <><IconPlus width={16} height={16} /> Add to cart</>}
    </button>
  );
}
