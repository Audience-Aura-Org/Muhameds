'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Site } from '@/lib/types';
import { IconArrowRight, IconChevron } from './Icons';

const INTERVAL = 6500;

export default function HeroSlider({ slides }: { slides: Site['heroSlides'] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches); }, []);
  const auto = !paused && !reduced && slides.length > 1;
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => setI((x) => (x + 1) % slides.length), INTERVAL);
    return () => clearTimeout(t);
  }, [auto, i, slides.length]);
  const go = (n: number) => setI((n + slides.length) % slides.length);

  // Only download a slide's image once it is shown, plus the next one when the browser is idle.
  // Stacked slides all count as "in viewport", so without this every hero image loads up front.
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set([0]));
  useEffect(() => {
    const add = (n: number) => setLoaded((s) => (s.has(n) ? s : new Set(s).add(n)));
    add(i);
    const next = (i + 1) % slides.length;
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => add(next), { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(() => add(next), 2500);
    return () => clearTimeout(t);
  }, [i, slides.length]);

  // swipe between slides on touch screens
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; setPaused(true); };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchX.current;
    touchX.current = null;
    setPaused(false);
    if (start == null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
  };

  return (
    <section aria-roledescription="carousel" aria-label="Featured" className="relative isolate overflow-hidden rounded-3xl bg-ink"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* on phones, fit the hero to the screen (minus header) without going shorter than 420px */}
      <div className="relative h-[clamp(420px,calc(100svh-150px),520px)] sm:h-[540px] lg:h-[620px]">
        {slides.map((s, n) => {
          const active = n === i;
          const Heading = n === 0 ? 'h1' : 'h2';
          return (
            <div key={s.title} role="group" aria-roledescription="slide" aria-label={`${n + 1} of ${slides.length}`} aria-hidden={!active} inert={!active}
              className={`absolute inset-0 transition-opacity duration-1000 ${active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
              {loaded.has(n) && (
                <Image src={s.image} alt={s.imageAlt} fill priority={n === 0} sizes="(min-width:1360px) 1280px, 100vw"
                  className={`object-cover transition-transform duration-[8000ms] ease-out ${active ? 'scale-105' : 'scale-100'}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10 sm:bg-gradient-to-r sm:from-ink/90 sm:via-ink/50 sm:to-ink/0" />
              <div className="absolute inset-0 flex items-end justify-center p-6 pb-24 text-center sm:items-center sm:justify-start sm:p-12 sm:text-left lg:p-20">
                <div className={`flex max-w-xl flex-col items-center text-white sm:block transition duration-700 ${active ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-4 opacity-0'}`}>
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-lime">
                    <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden />Muha Meds Store
                  </p>
                  <Heading className="mt-5 font-display text-[38px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl">{s.title}</Heading>
                  <p className="mt-4 max-w-md text-base text-white/75 sm:text-lg">{s.subtitle}</p>
                  <Link href={s.cta.href} className="btn btn-lime btn-lg group/cta mt-8">
                    {s.cta.label.charAt(0) + s.cta.label.slice(1).toLowerCase()}
                    <IconArrowRight width={18} height={18} className="transition-transform group-hover/cta:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <div className="absolute inset-x-6 bottom-6 flex items-center justify-center gap-4 sm:justify-between sm:inset-x-12 lg:inset-x-20 lg:bottom-10">
          <div className="flex gap-2">
            {slides.map((s, n) => (
              <button key={s.title} onClick={() => go(n)} aria-label={`Go to slide ${n + 1}`} aria-current={n === i}
                className="group/dot relative h-1 w-10 overflow-hidden rounded-full bg-white/25 py-2 [background-clip:content-box] sm:w-14">
                <span key={n === i ? `${i}-${auto}` : 'idle'} aria-hidden
                  className={`absolute inset-x-0 inset-y-2 origin-left rounded-full bg-white ${n === i ? '' : 'scale-x-0'}`}
                  style={n === i && auto ? { animation: `grow-x ${INTERVAL}ms linear both` } : undefined} />
              </button>
            ))}
          </div>
          <div className="hidden gap-2 sm:flex">
            <button onClick={() => go(i - 1)} aria-label="Previous slide" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-ink/30 text-white transition hover:bg-white hover:text-ink"><IconChevron className="rotate-180" width={20} /></button>
            <button onClick={() => go(i + 1)} aria-label="Next slide" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-ink/30 text-white transition hover:bg-white hover:text-ink"><IconChevron width={20} /></button>
          </div>
        </div>
      )}
    </section>
  );
}
