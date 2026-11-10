import type { Metadata, Viewport } from 'next';
import { Poppins, Quicksand } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/catalog';
import { SITE_URL } from '@/lib/site-url';
import { describe } from '@/lib/seo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgeGate, { ageGateBootScript } from '@/components/AgeGate';
import MobileTabBar from '@/components/MobileTabBar';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins', display: 'swap' });
const quicksand = Quicksand({ subsets: ['latin'], variable: '--font-quicksand', display: 'swap' });

// Defaults inherited by every route. Deliberately no `alternates.canonical` or `openGraph.url`
// here: children that don't set their own would inherit the home page's URL.
// favicon/apple icon: app/icon.png + app/apple-icon.png; share image: app/opengraph-image.tsx
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.name} | Concentrates, Cartridges & Disposable Vapes`, template: `%s | ${site.name}` },
  description: describe(site.tagline),
  applicationName: site.name,
  publisher: site.name,
  category: 'shopping',
  keywords: ['Muha Meds', 'Muha Meds store', 'Muha Meds cartridges', 'Muha Meds disposables', 'live resin', 'concentrates', 'vape cartridges', 'disposable vapes'],
  formatDetection: { telephone: false, address: false, email: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: { siteName: site.name, type: 'website', locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
  // set in the hosting env after adding the site in Search Console / Bing Webmaster Tools
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

// viewport-fit=cover makes env(safe-area-inset-*) report real values on notched iPhones
export const viewport: Viewport = { themeColor: '#0c1411', viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the age-gate boot script may add a class to <html> before hydration
    <html lang="en" className={`${poppins.variable} ${quicksand.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ageGateBootScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
        <Header nav={site.nav} promo={site.promoBar} logo={site.logo} name={site.name} />
        <main id="main" className="pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
        <Footer />
        <MobileTabBar />
        <AgeGate />
      </body>
    </html>
  );
}
