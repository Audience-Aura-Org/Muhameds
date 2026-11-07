'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, type ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'href' | 'prefetch'> & { href: string };

/**
 * Link that prefetches on intent (touchstart / hover / focus) instead of on viewport entry.
 *
 * Next's default viewport prefetch fetches and parses the payload of every product link
 * that scrolls into view — on a listing page that is dozens of routes, which costs mobile
 * users data and seconds of main-thread time. A touchstart lands ~100ms before the click,
 * which is enough to make the navigation feel instant.
 */
export default function IntentLink({ href, onMouseEnter, onTouchStart, onFocus, ...rest }: Props) {
  const router = useRouter();
  const done = useRef(false);
  const warm = useCallback(() => {
    if (done.current) return;
    done.current = true;
    router.prefetch(href);
  }, [router, href]);

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={(e) => { warm(); onMouseEnter?.(e); }}
      onTouchStart={(e) => { warm(); onTouchStart?.(e); }}
      onFocus={(e) => { warm(); onFocus?.(e); }}
      {...rest}
    />
  );
}
