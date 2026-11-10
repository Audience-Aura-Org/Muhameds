import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { products, site } from '@/lib/catalog';

// Default social share card (Facebook, X, iMessage, WhatsApp…). Rendered once at build time.
// Product pages override it with the product photo.
export const alt = `${site.name} — concentrates, cartridges and disposable vapes`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  const logo = await readFile(path.join(process.cwd(), 'public', site.logo));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: '#0c1411', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={96} height={96} alt="" style={{ objectFit: 'contain' }} />
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>{site.name}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2, maxWidth: 980 }}>
            Premium concentrates, carts &amp; disposables.
          </div>
          <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.65)' }}>Top quality Muha products · Free shipping over $500</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', background: '#c9f26b', color: '#0c1411', borderRadius: 999, padding: '12px 28px', fontSize: 28, fontWeight: 700 }}>
            Shop {products.length}+ products
          </div>
          <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.55)' }}>muhamedstore.com</div>
        </div>
      </div>
    ),
    size,
  );
}
