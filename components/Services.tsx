import Image from 'next/image';
import { site } from '@/lib/catalog';

const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function Services() {
  return (
    <section className="container-x mt-20 sm:mt-28" aria-label="Why shop with us">
      <ul className="grid grid-cols-2 overflow-hidden rounded-3xl border border-line bg-card sm:grid-cols-3 lg:grid-cols-5">
        {site.home.services.map((s) => (
          <li key={s.title} className="-mb-px -mr-px flex flex-col gap-3 border-b border-r border-line p-5 sm:p-6 lg:border-b-0">
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
