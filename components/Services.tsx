import Image from 'next/image';
import { site } from '@/lib/catalog';

export default function Services() {
  return (
    <section className="container-x mt-24" aria-label="Why shop with us">
      <ul className="grid grid-cols-2 gap-4 rounded-[2rem] border border-line bg-white p-6 sm:grid-cols-3 lg:grid-cols-5 lg:p-8">
        {site.home.services.map((s) => (
          <li key={s.title} className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage-50"><Image src={s.icon} alt="" width={26} height={26} /></span>
            <span><strong className="block text-sm">{s.title}</strong><span className="text-xs text-muted">{s.text}</span></span>
          </li>
        ))}
      </ul>
    </section>
  );
}
