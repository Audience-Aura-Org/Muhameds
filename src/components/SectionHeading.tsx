import Link from 'next/link';

export default function SectionHeading({ title, eyebrow, href, linkLabel = 'View all' }: { title: string; eyebrow?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="h-display text-3xl capitalize sm:text-4xl">{title.toLowerCase()}</h2>
      </div>
      {href && <Link href={href} className="shrink-0 text-sm font-semibold text-sage-700 underline-offset-4 hover:underline">{linkLabel} →</Link>}
    </div>
  );
}
