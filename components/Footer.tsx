import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/lib/catalog';
import { IconMail, IconPin } from './Icons';

export default function Footer() {
  const f = site.footer;
  return (
    <footer className="mt-16 bg-ink text-white/70 sm:mt-28">
      <div className="container-x py-12 sm:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 text-center md:gap-12 md:text-left lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-16">
          <div className="col-span-2 flex flex-col items-center space-y-5 md:col-span-1 md:items-start">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src={f.logo} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
              <span className="font-display text-2xl font-bold tracking-tight text-white">{site.name}</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed">{f.about[0]}</p>
            <ul className="space-y-2.5 pt-1 text-sm">
              <li className="flex items-start justify-center gap-2.5 md:justify-start"><IconPin width={18} height={18} className="mt-0.5 shrink-0 text-lime" />{site.address}</li>
              <li><a href={`mailto:${site.email}`} className="inline-flex items-center gap-2.5 transition hover:text-white"><IconMail width={18} height={18} className="shrink-0 text-lime" />{site.email}</a></li>
            </ul>
          </div>
          {f.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">{col.title.replace('Costumer', 'Customer')}</h2>
              <ul className="space-y-3 text-[15px] [&_a]:inline-block [&_a]:py-0.5">
                {col.links.map((l) => <li key={l.label}><Link href={l.href} className="transition hover:text-white">{l.label}</Link></li>)}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-center text-xs text-white/45 sm:flex-row sm:text-left">
          <p>{f.copyright}</p>
          <p className="inline-flex flex-wrap items-center justify-center gap-2"><span className="rounded border border-white/20 px-1.5 py-0.5 font-semibold text-white/70">21+</span>For adults only. Keep out of reach of children and pets.</p>
        </div>
      </div>
    </footer>
  );
}
