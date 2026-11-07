'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Site } from '@/lib/types';
import { IconChevron } from './Icons';

export default function HeroSlider({ slides }: { slides: Site['heroSlides'] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [paused, slides.length]);
  const go = (n: number) => setI((n + slides.length) % slides.length);

  return (
    <section aria-roledescription="carousel" aria-label="Featured" className="relative overflow-hidden rounded-[2rem] bg-ink"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="relative h-[460px] sm:h-[520px] lg:h-[600px]">
        {slides.map((s, n) => (
          <div key={s.title} role="group" aria-roledescription="slide" aria-label={`${n + 1} of ${slides.length}`} aria-hidden={n !== i}
            className={`absolute inset-0 transition-opacity duration-700 ${n === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
            <Image src={s.image} alt={s.imageAlt} fill priority={n === 0} sizes="(min-width:1320px) 1320px, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10 sm:bg-gradient-to-r sm:from-ink/85 sm:via-ink/45 sm:to-transparent" />
            <div className="absolute inset-0 flex items-end p-6 sm:items-center sm:p-12 lg:p-20">
              <div className="max-w-xl text-white">
                <p className="eyebrow !text-gold">Muha Meds Store</p>
                {n === 0 ? <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">{s.title}</h1>
                  : <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">{s.title}</h2>}
                <p className="mt-4 text-lg text-white/80">{s.subtitle}</p>
                <Link href={s.cta.href} tabIndex={n === i ? 0 : -1} className="btn mt-8 bg-white text-ink hover:bg-gold">{s.cta.label}</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 flex items-center gap-2">
          <button onClick={() => go(i - 1)} aria-label="Previous slide" className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30"><IconChevron className="rotate-180" /></button>
          <div className="flex gap-1.5 px-1">
            {slides.map((s, n) => <button key={s.title} onClick={() => go(n)} aria-label={`Go to slide ${n + 1}`} aria-current={n === i} className={`h-2 rounded-full transition-all ${n === i ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} />)}
          </div>
          <button onClick={() => go(i + 1)} aria-label="Next slide" className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/30"><IconChevron /></button>
        </div>
      )}
    </section>
  );
}
