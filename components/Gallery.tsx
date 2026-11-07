'use client';
import Image from 'next/image';
import { useRef, useState } from 'react';

export default function Gallery({ images, alt, activeImage }: { images: string[]; alt: string; activeImage?: string | null }) {
  const [i, setI] = useState(0);
  // Animate only after the shopper changes image: fading the first image in from opacity 0
  // would delay Largest Contentful Paint on the product page.
  const [changed, setChanged] = useState(false);
  const all = activeImage && !images.includes(activeImage) ? [activeImage, ...images] : images;
  const current = activeImage && all.includes(activeImage) && i === 0 ? activeImage : all[i] ?? all[0];
  const show = (n: number) => { setI((n + all.length) % all.length); setChanged(true); };

  // swipe between photos on touch screens
  const touchX = useRef<number | null>(null);
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchX.current;
    touchX.current = null;
    if (start == null || all.length < 2) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 40) show(all.indexOf(current) + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse">
      <div className="img-well relative aspect-square flex-1 overflow-hidden rounded-3xl"
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }} onTouchEnd={onTouchEnd}>
        {current && (
          <Image key={current} src={current} alt={alt} fill priority sizes="(min-width:1024px) 620px, 100vw"
            className={`img-blend object-contain p-8 sm:p-12 ${changed ? 'animate-fade-up' : ''}`} />
        )}
        {all.length > 1 && (
          <p className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium tabular-nums text-white lg:hidden" aria-hidden>
            {all.indexOf(current) + 1} / {all.length}
          </p>
        )}
      </div>
      {all.length > 1 && (
        <ul className="no-scrollbar flex gap-2.5 overflow-x-auto lg:flex-col" aria-label="Product images">
          {all.map((src, n) => (
            <li key={src} className="shrink-0">
              <button type="button" onClick={() => show(n)} aria-label={`Show image ${n + 1}`} aria-current={src === current}
                className={`img-well relative block h-[72px] w-[72px] overflow-hidden rounded-xl ring-offset-2 ring-offset-paper transition ${src === current ? 'ring-2 ring-ink' : 'opacity-70 hover:opacity-100'}`}>
                <Image src={src} alt="" fill sizes="72px" className="img-blend object-contain p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
