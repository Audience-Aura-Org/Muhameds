import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/lib/catalog';
import { IconMail, IconPin } from './Icons';

export default function Footer() {
  const f = site.footer;
  return (
    <footer className="mt-24 bg-ink text-white/80">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Image src={f.logo} alt={site.name} width={72} height={72} className="h-16 w-16 object-contain" />
          {f.about.map((p, i) => <p key={i} className="max-w-md text-sm leading-relaxed text-white/70">{p}</p>)}
          <ul className="space-y-2 pt-2 text-sm">
            <li className="flex items-center gap-2"><IconPin width={18} height={18} className="text-sage" />{site.address}</li>
            <li><a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-white"><IconMail width={18} height={18} className="text-sage" />{site.email}</a></li>
          </ul>
        </div>
        {f.columns.map((col) => (
          <div key={col.title}>
            <h2 className="mb-4 font-display text-base font-semibold text-white">{col.title}</h2>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => <li key={l.label}><Link href={l.href} className="hover:text-white hover:underline underline-offset-4">{l.label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/50 sm:flex-row">
          <p>{f.copyright}</p>
          <p>For adults 21+ only. Keep out of reach of children and pets.</p>
        </div>
      </div>
    </footer>
  );
}
