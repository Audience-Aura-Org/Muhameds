import type { Metadata, Viewport } from 'next';
import { Poppins, Quicksand } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/catalog';
import { SITE_URL } from '@/lib/site-url';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgeGate, { ageGateBootScript } from '@/components/AgeGate';
import MobileTabBar from '@/components/MobileTabBar';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins', display: 'swap' });
const quicksand = Quicksand({ subsets: ['latin'], variable: '--font-quicksand', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `Muha MEds - ${site.name}`, template: `%s - ${site.name}` },
  description: site.tagline,
  // favicon + apple touch icon: app/icon.png and app/apple-icon.png (resized from site.favicon)
  openGraph: { siteName: site.name, type: 'website' },
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
