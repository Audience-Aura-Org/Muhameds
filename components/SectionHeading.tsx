import IntentLink from '@/components/IntentLink';
import { IconArrowRight } from './Icons';

type Props = { title: string; eyebrow?: string; href?: string; linkLabel?: string; actions?: React.ReactNode; id?: string };

/** Data titles arrive in SHOUTING CASE from the old CMS; normalise to Title Case. */
const titleCase = (s: string) => (s === s.toUpperCase() ? s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()) : s);

export default function SectionHeading({ title, eyebrow, href, linkLabel = 'View all', actions, id }: Props) {
  return (
    // phones: centred, link under the title; sm+: title left, link/actions right
    <div className="mb-6 flex flex-col items-center gap-2 text-center sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:text-left">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 id={id} className="h-display text-[26px] leading-[1.1] sm:text-4xl">{titleCase(title)}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {href && (
          <IntentLink href={href} className="group/link inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition hover:text-brand-700">
            {linkLabel}
            <IconArrowRight width={16} height={16} className="transition-transform group-hover/link:translate-x-0.5" />
          </IntentLink>
        )}
        {actions}
      </div>
    </div>
  );
}
