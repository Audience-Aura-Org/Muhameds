import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPage, pages, site } from '@/lib/catalog';
import ContactForm from '@/components/ContactForm';
import JsonLd from '@/components/JsonLd';
import { breadcrumbLd, describe } from '@/lib/seo';
import { IconMail, IconPin } from '@/components/Icons';

type Props = { params: Promise<{ slug: string }> };

// order-tracking has its own route
const CONTENT = () => pages.filter((p) => p.slug !== 'order-tracking');

export const dynamicParams = false;
export function generateStaticParams() {
  return CONTENT().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPage((await params).slug);
  if (!p) return {};
  const description = describe(p.seo.description, p.html, `${p.title} — ${site.name}.`);
  return { title: p.title, description, alternates: { canonical: `/${p.slug}` }, openGraph: { title: p.title, description, url: `/${p.slug}` } };
}

export default async function ContentPage({ params }: Props) {
  const p = getPage((await params).slug);
  if (!p) notFound();
  const isContact = p.slug === 'contact-us' || p.slug === 'customer-support';
  // the first heading in the migrated body usually repeats the page title
  const body = p.html.replace(new RegExp(`^\\s*<h2>\\s*${p.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</h2>`, 'i'), '');
  return (
    <div className="container-x pt-8 sm:pt-12">
      <JsonLd data={breadcrumbLd([{ name: 'Home', path: '/' }, { name: p.title, path: `/${p.slug}` }])} />
      <header className="mx-auto max-w-3xl text-center sm:text-left">
        <h1 className="h-display text-[34px] leading-[1.05] sm:text-[56px]">{p.title}</h1>
      </header>
      <div className={`mx-auto mt-6 grid gap-10 sm:mt-10 ${isContact ? 'max-w-6xl lg:grid-cols-[1fr_1fr]' : 'max-w-3xl'}`}>
        <div className="rich" dangerouslySetInnerHTML={{ __html: body }} />
        {isContact && (
          <div className="space-y-6">
            <ContactForm />
            <ul className="space-y-3 surface p-6 text-sm">
              <li className="flex items-center gap-3"><IconPin className="text-brand-700" />{site.address}</li>
              <li><a href={`mailto:${site.email}`} className="flex items-center gap-3 hover:underline"><IconMail className="text-brand-700" />{site.email}</a></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
