import { site } from './catalog';
import { SITE_URL } from './site-url';

/** Absolute URL for structured data / sitemaps (metadata uses metadataBase instead). */
export const abs = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`);

/** HTML -> plain text. */
export const plainText = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/** Meta description: first non-empty candidate, plain text, cut on a word boundary at ~155 chars. */
export function describe(...candidates: (string | undefined | null)[]) {
  for (const c of candidates) {
    const t = c ? plainText(c) : '';
    if (t.length >= 30) return t.length > 158 ? t.slice(0, 155).replace(/\s\S*$/, '') + '…' : t;
  }
  return describe(site.tagline);
}

/** Old WordPress SEO titles end in " - Muha Meds Store"; the title template adds that back. */
export const seoTitle = (title: string | undefined, fallback: string) => title?.replace(/\s+[-|–]\s+Muha Meds Store$/i, '').replace(/ Archives$/i, '').trim() || fallback;

export const ORG_ID = `${SITE_URL}/#organization`;

export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  '@id': ORG_ID,
  name: site.name,
  url: SITE_URL,
  logo: abs(site.logo),
  image: abs(site.heroSlides[0]?.image ?? site.logo),
  description: describe(site.tagline),
  email: site.email.toLowerCase(),
  address: { '@type': 'PostalAddress', streetAddress: '634 Kohler St', addressLocality: 'Los Angeles', addressRegion: 'CA', postalCode: '90021', addressCountry: 'US' },
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: site.email.toLowerCase(), availableLanguage: ['English'] },
  paymentAccepted: site.paymentMethods.map((m) => m.label).join(', '),
  currenciesAccepted: 'USD',
};

export const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: site.name,
  url: SITE_URL,
  publisher: { '@id': ORG_ID },
  inLanguage: 'en-US',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/shop?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

/** Filtered / sorted / paginated / search listing URLs: keep crawlable, but don't index duplicates. */
export const isFilteredListing = (p: Record<string, string | undefined>) => Boolean(p.q || p.min || p.max || p.sort || (p.page && p.page !== '1'));
