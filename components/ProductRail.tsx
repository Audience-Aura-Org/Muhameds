'use client';
import { Children, useCallback, useEffect, useRef, useState } from 'react';
import { IconChevron } from './Icons';
import SectionHeading from './SectionHeading';

type Props = { title: string; eyebrow?: string; href?: string; children: React.ReactNode };

/**
 * Horizontal, scroll-snapping product row. Cards are passed in as server-rendered
 * children, so only the scroll controls ship as client JS.
 */
export default function ProductRail({ title, eyebrow, href, children }: Props) {
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    const ro = new ResizeObserver(update);
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  const btn = 'grid h-10 w-10 place-items-center rounded-full border border-line-strong bg-card text-ink transition hover:border-ink disabled:pointer-events-none disabled:opacity-35';
  const scrollable = !(edge.start && edge.end);

  return (
    <div>
      <SectionHeading
        title={title}
        eyebrow={eyebrow}
        href={href}
        actions={scrollable ? (
          <div className="hidden gap-2 sm:flex">
            <button type="button" className={btn} onClick={() => page(-1)} disabled={edge.start} aria-label={`Scroll ${title} back`}><IconChevron width={18} className="rotate-180" /></button>
            <button type="button" className={btn} onClick={() => page(1)} disabled={edge.end} aria-label={`Scroll ${title} forward`}><IconChevron width={18} /></button>
          </div>
        ) : null}
      />
      <ul
        ref={ref}
        onScroll={update}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
      >
        {Children.map(children, (child) => (
          <li className="flex w-[46%] shrink-0 snap-start sm:w-[calc((100%-2*1.25rem)/3)] xl:w-[calc((100%-3*1.25rem)/4)]">{child}</li>
        ))}
      </ul>
    </div>
  );
}
