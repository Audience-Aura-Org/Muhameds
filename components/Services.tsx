import Image from 'next/image';
import { site } from '@/lib/catalog';

const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function Services() {
  return (
    <section className="container-x mt-14 sm:mt-24 lg:mt-28" aria-label="Why shop with us">
      <ul className="grid grid-cols-2 overflow-hidden rounded-3xl border border-line bg-card sm:grid-cols-3 lg:grid-cols-5">
        {site.home.services.map((s) => (
          <li key={s.title} className="-mb-px -mr-px flex flex-col items-center gap-3 border-b border-r border-line p-4 text-center sm:items-start sm:p-6 sm:text-left lg:border-b-0">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50"><Image src={s.icon} alt="" width={24} height={24} className="h-6 w-6 object-contain" /></span>
            <span>
              <strong className="block text-[15px] font-semibold">{sentence(s.title).replace('24/7 support', '24/7 Support')}</strong>
              <span className="text-sm text-muted">{s.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
