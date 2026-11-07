import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { site } from '@/lib/catalog';
import { SITE_URL } from '@/lib/site-url';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgeGate from '@/components/AgeGate';
import MobileTabBar from '@/components/MobileTabBar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `Muha MEds - ${site.name}`, template: `%s - ${site.name}` },
  description: site.tagline,
  icons: { icon: site.favicon, apple: site.favicon },
  openGraph: { siteName: site.name, type: 'website' },
};

export const viewport: Viewport = { themeColor: '#16201b' };

const TAWK_SRC = process.env.NEXT_PUBLIC_TAWK_SRC ?? 'https://embed.tawk.to/698bdda67aab411c372a4cf8/1jh55jl9j';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-dvh antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
        <Header nav={site.nav} promo={site.promoBar} logo={site.logo} name={site.name} />
        <main id="main" className="pb-20 lg:pb-0">{children}</main>
        <Footer />
        <MobileTabBar />
        <AgeGate />
        {TAWK_SRC && (
          <Script id="tawk" strategy="lazyOnload">{`var Tawk_API=Tawk_API||{};(function(){var s=document.createElement("script");s.async=true;s.src=${JSON.stringify(TAWK_SRC)};s.charset="UTF-8";s.setAttribute("crossorigin","*");document.body.appendChild(s);})();`}</Script>
        )}
      </body>
    </html>
  );
}
