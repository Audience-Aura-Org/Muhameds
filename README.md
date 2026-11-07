# Muha Meds Store — Next.js storefront

A standalone Next.js 15 (App Router, TypeScript, Tailwind v4) rebuild of muhamedstore.com.
No WordPress: catalog and page content live in `data/*.json`, orders are handled by
the app's own API, and customers pay manually (Zelle | Venmo, Cashapp or crypto, Chime).

## Run it

```bash
npm install
cp .env.example .env.local   # fill in SMTP so order emails are actually sent
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

Requires Node 20+. The production server must have a **persistent, writable** `DATA_DIR`
(default `./var`) — that is where orders, contact messages and pending reviews are saved.
Works on a VPS, Docker, or a Hostinger Node.js app. On serverless hosts (Vercel/Netlify)
the disk is wiped between requests: replace `lib/store.ts` with a database first.

## How orders work

1. Cart and wishlist live in the browser (`localStorage`).
2. `/api/quote` re-prices every cart line from the catalog (client prices are never
   trusted), applies coupons and shipping. The cart and checkout show these server totals.
3. `/api/orders` validates the checkout form, re-prices again, saves the order to
   `DATA_DIR/orders.json`, and emails the customer and `STORE_EMAIL`.
4. The customer lands on `/order-received/<number>?key=<secret>` with payment instructions.
5. `/order-tracking` looks an order up by order number + billing email.

To change an order's status, edit `status` in `var/orders.json`
(`pending-payment` → `processing` → `shipped` → `completed`, or `cancelled`).

Pricing rules (`data/site.json`):
- `shipping.flatRate` = $10.00, free when the order (after discount) reaches `shipping.freeOver` = $500.
- `coupons`: `WDPILLS23` = 10% off, first order per email only.
- `paymentMethods[].instructions` (optional) — e.g. your Zelle/CashApp handle. `{order}` is replaced
  with the order number. Without it customers are told the details will be emailed.

## Editing content

- Products, categories, pages: `data/products.json`, `categories.json`, `pages.json`.
- Menus, footer, home page copy, coupons, shipping, payment methods: `data/site.json`.
- Images: `public/media/…`.
- Real customer testimonials: add to `site.json → testimonials` (`{ name, location, text }`); the
  home-page section appears automatically.
- New reviews submitted on the site go to `var/reviews-pending.json` for moderation; to publish
  one, add it to the product's `reviews` array.

`scripts/extract.mjs` regenerates the data from the HTTrack copy of the old site
(`node scripts/extract.mjs "<path to mirror>/muhamedstore.com"`). Running it overwrites
manual edits in `data/`, so only use it for the initial import.

## SEO / migration

Old WordPress URLs redirect permanently (see `next.config.ts`): trailing slashes,
`/refund_returns/`, `/my-account/`, `/shop/page/N/`, `/wp-content/uploads/…` → `/media/…`, feeds.
`/sitemap.xml` and `/robots.txt` are generated. Set `NEXT_PUBLIC_SITE_URL` in production.

## Security

- Server-side validation (zod) on every API; prices recomputed server-side.
- Honeypot field + per-IP rate limits on orders, contact and reviews (validation failures
  don't consume the strict quota, so typos never lock customers out).
- Reviews containing links are rejected (the old site's spam reviews were all link drops);
  all reviews are moderated.
- Order confirmation pages require a 128-bit secret key; order lookup requires the billing email.
- Security headers (HSTS, nosniff, frame options, referrer and permissions policy).
- No WordPress, no PHP, no plugins — removes the attack surface the old site was compromised through.
