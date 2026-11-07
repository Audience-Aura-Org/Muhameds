import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ['image/webp'] },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/media/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ];
  },
  // Keep old WordPress URLs working (search engines, bookmarks, links in emails)
  async redirects() {
    return [
      { source: '/refund_returns', destination: '/refund-returns', permanent: true },
      { source: '/my-account/:path*', destination: '/order-tracking', permanent: true },
      { source: '/medical-experts', destination: '/contact-us', permanent: true },
      { source: '/shop/page/:n', destination: '/shop?page=:n', permanent: true },
      { source: '/product-category/:slug/page/:n', destination: '/product-category/:slug?page=:n', permanent: true },
      { source: '/feed', destination: '/', permanent: true },
      { source: '/:path*/feed', destination: '/:path*', permanent: true },
      { source: '/wp-content/uploads/:path*', destination: '/media/:path*', permanent: true },
      { source: '/wp-admin/:path*', destination: '/', permanent: false },
      { source: '/wp-login.php', destination: '/', permanent: false },
      { source: '/xmlrpc.php', destination: '/', permanent: false },
    ];
  },
};

export default nextConfig;
