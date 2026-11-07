'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function Gallery({ images, alt, activeImage }: { images: string[]; alt: string; activeImage?: string | null }) {
  const [i, setI] = useState(0);
  const all = activeImage && !images.includes(activeImage) ? [activeImage, ...images] : images;
  const current = activeImage && all.includes(activeImage) && i === 0 ? activeImage : all[i] ?? all[0];
  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-line bg-gradient-to-b from-sage-50 to-white">
        {current && <Image src={current} alt={alt} fill priority sizes="(min-width:1024px) 600px, 100vw" className="object-contain p-8" />}
      </div>
      {all.length > 1 && (
        <ul className="flex gap-3" aria-label="Product images">
          {all.map((src, n) => (
            <li key={src}>
              <button type="button" onClick={() => setI(n)} aria-label={`Show image ${n + 1}`} aria-current={src === current}
                className={`relative h-20 w-20 overflow-hidden rounded-2xl border bg-white transition ${src === current ? 'border-ink' : 'border-line hover:border-ink-soft'}`}>
                <Image src={src} alt="" fill sizes="80px" className="object-contain p-2" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
