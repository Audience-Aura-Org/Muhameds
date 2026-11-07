// Extracts catalog + page content from the HTTrack mirror into src/data/*.json
// and copies referenced images into public/media. Re-runnable.
// Usage: node scripts/extract.mjs [mirrorDir]
import * as cheerio from 'cheerio';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIRROR = process.argv[2] || 'C:/My Web Sites/https___muhamedstore.com_/muhamedstore.com';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src/data');
const MEDIA = path.join(ROOT, 'public/media');
fs.mkdirSync(DATA, { recursive: true });
fs.mkdirSync(MEDIA, { recursive: true });

const log = { contentFixes: [], missingImages: [], notes: [] };
const read = (rel) => fs.readFileSync(path.join(MIRROR, rel), 'utf8');
const load = (rel) => { CURRENT_FILE = rel; return cheerio.load(read(rel)); };
const clean = (s) => (s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
const money = (s) => { const m = String(s).replace(/,/g, '').match(/(\d+(?:\.\d+)?)/); return m ? Math.round(parseFloat(m[1]) * 100) : null; };

// ---------- images ----------
const UPLOADS = path.join(MIRROR, 'wp-content/uploads');
const dirCache = new Map();
function listDir(d) { if (!dirCache.has(d)) dirCache.set(d, fs.existsSync(d) ? fs.readdirSync(d) : []); return dirCache.get(d); }
const copied = new Map();
/** Resolve any reference (absolute live URL or relative mirror path) to a local /media/... URL. */
function media(ref) {
  if (!ref) return null;
  let p = ref.split('?')[0].split('#')[0];
  const i = p.indexOf('wp-content/uploads/');
  if (i < 0) return null;
  const rel = decodeURIComponent(p.slice(i + 'wp-content/uploads/'.length));
  if (copied.has(rel)) return copied.get(rel);
  const dir = path.join(UPLOADS, path.dirname(rel));
  const base = path.basename(rel);
  const ext = path.extname(base);
  const stem = base.slice(0, -ext.length).replace(/-\d+x\d+$/, '');
  let chosen = null;
  if (fs.existsSync(path.join(dir, base)) && fs.statSync(path.join(dir, base)).size > 0) chosen = base;
  // prefer the full-size original, else the largest downloaded variant of the same image
  const normExt = (e) => e.toLowerCase().replace('jpeg', 'jpg');
  const variants = listDir(dir).filter((f) => {
    const fe = path.extname(f), fs_ = f.slice(0, -fe.length);
    return normExt(fe) === normExt(ext) && (fs_ === stem || (fs_.startsWith(stem + '-') && /^-\d+x\d+$/.test(fs_.slice(stem.length))));
  });
  const best = variants.map((f) => ({ f, s: fs.statSync(path.join(dir, f)).size })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s)[0];
  if (best && (!chosen || best.s > fs.statSync(path.join(dir, chosen)).size)) chosen = best.f;
  if (!chosen) { log.missingImages.push(rel); copied.set(rel, null); return null; }
  const outRel = path.join(path.dirname(rel), chosen).replace(/\\/g, '/');
  const out = path.join(MEDIA, outRel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (!fs.existsSync(out)) fs.copyFileSync(path.join(dir, chosen), out);
  const url = '/media/' + outRel.split('/').map(encodeURIComponent).join('/');
  copied.set(rel, url);
  return url;
}
function imgSrc($img) {
  return $img.attr('data-large_image') || $img.attr('data-src') || $img.attr('src');
}

// ---------- links ----------
/** Mirror file whose links are being resolved (relative hrefs are relative to it). */
let CURRENT_FILE = 'index.html';
/** Map mirror-relative or live URLs to app routes. */
function route(href) {
  if (!href) return null;
  let h = href.trim();
  if (/^(mailto:|tel:|#)/.test(h)) return h;
  h = h.replace(/^https?:\/\/(www\.)?muhamedstore\.com/i, '');
  if (/^https?:\/\//.test(h)) return h; // external
  if (!h.startsWith('/')) h = path.posix.normalize('/' + path.posix.join(path.posix.dirname(CURRENT_FILE), h));
  h = h.replace(/\/index[0-9a-f]{0,4}\.html$/, '/').replace(/\.html$/, '');
  if (h.includes('/wp-content/uploads/')) return media(h);
  const m = h.match(/^\/(product|product-category)\/([^/]+)/);
  if (m) return `/${m[1]}/${m[2]}`;
  const simple = { '/': '/', '/shop/': '/shop', '/cart/': '/cart', '/checkout/': '/checkout', '/wishlist/': '/wishlist', '/my-account/': '/order-tracking', '/order-tracking/': '/order-tracking' };
  if (simple[h]) return simple[h];
  const pm = h.match(/^\/([a-z0-9_-]+)\/?$/);
  if (pm) return '/' + pm[1].replace(/_/g, '-');
  return h;
}

// ---------- HTML sanitizer ----------
const ALLOWED = new Set(['p', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'a', 'br', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'img', 'hr']);
const PROMPT_LEFTOVER = /^\s*(give me|write me|write a|generate|create a)\b.{0,120}\b(description|content|article|paragraph)/i;
function sanitize($, el, ctx) {
  const $root = $(el).clone();
  $root.find('script,style,noscript,svg,form,button,iframe').remove();
  // remove pasted ChatGPT prompts that ended up in the published copy
  $root.find('*').each((_, n) => {
    const $n = $(n);
    if ($n.children().length === 0 && PROMPT_LEFTOVER.test($n.text())) {
      log.contentFixes.push({ where: ctx, removed: clean($n.text()), reason: 'AI prompt pasted into published copy' });
      $n.remove();
    }
  });
  const walk = (node) => {
    let out = '';
    for (const c of node.childNodes || []) {
      if (c.type === 'text') { out += escapeHtml(c.data.replace(/\u00a0/g, ' ')); continue; }
      if (c.type !== 'tag') continue;
      const tag = c.name.toLowerCase();
      const inner = walk(c);
      if (!ALLOWED.has(tag)) { out += inner; continue; }
      if (tag === 'h1') { out += `<h2>${inner}</h2>`; continue; }
      if (tag === 'img') { const s = media(c.attribs['data-src'] || c.attribs.src); if (s) out += `<img src="${s}" alt="${escapeHtml(c.attribs.alt || '')}" loading="lazy">`; continue; }
      if (tag === 'a') {
        const r = route(c.attribs.href);
        if (!r || r === '/' && !clean(inner)) { out += inner; continue; }
        const ext = /^https?:/.test(r);
        out += `<a href="${escapeHtml(r)}"${ext ? ' rel="nofollow noopener" target="_blank"' : ''}>${inner}</a>`; continue;
      }
      if (tag === 'br' || tag === 'hr') { out += `<${tag}>`; continue; }
      if (!clean(inner.replace(/<[^>]+>/g, '')) && !/img/.test(inner)) continue; // drop empty blocks
      out += `<${tag}>${inner}</${tag}>`;
    }
    return out;
  };
  return walk($root.get(0)).replace(/(<br>\s*){3,}/g, '<br><br>').trim();
}
function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// ---------- categories & listing order ----------
function cardSlugs($) {
  const out = [];
  $('.wd-product .wd-entities-title a, .product-grid-item .wd-entities-title a').each((_, a) => {
    const r = route($(a).attr('href'));
    const m = r && r.match(/^\/product\/(.+)$/);
    if (m && !out.includes(m[1])) out.push(m[1]);
  });
  return out;
}
function listingPages(base) {
  const pages = [`${base}/index.html`];
  const pdir = path.join(MIRROR, base, 'page');
  if (fs.existsSync(pdir)) for (const n of fs.readdirSync(pdir).map(Number).filter(Boolean).sort((a, b) => a - b)) {
    if (fs.existsSync(path.join(pdir, String(n), 'index.html'))) pages.push(`${base}/page/${n}/index.html`);
  }
  return pages;
}
const categories = [];
for (const slug of fs.readdirSync(path.join(MIRROR, 'product-category'))) {
  const pages = listingPages(`product-category/${slug}`);
  const $ = load(pages[0]);
  const name = clean($('h1').first().text()) || slug;
  const products = [];
  for (const p of pages) for (const s of cardSlugs(load(p))) if (!products.includes(s)) products.push(s);
  CURRENT_FILE = pages[0];
  const desc = $('.term-description').length ? sanitize($, $('.term-description').get(0), `category ${slug}`) : '';
  categories.push({ slug, name, description: desc, products, seo: { title: clean($('title').text()), description: $('meta[name=description]').attr('content') || '' } });
}
const shopOrder = [];
for (const p of listingPages('shop')) for (const s of cardSlugs(load(p))) if (!shopOrder.includes(s)) shopOrder.push(s);

// ---------- products ----------
const products = [];
const sharedBlocks = new Map();
for (const slug of fs.readdirSync(path.join(MIRROR, 'product'))) {
  const file = `product/${slug}/index.html`;
  if (!fs.existsSync(path.join(MIRROR, file)) || fs.statSync(path.join(MIRROR, file)).size === 0) { log.notes.push('missing product page ' + slug); continue; }
  const $ = load(file);
  const id = Number(($('body').attr('class') || '').match(/postid-(\d+)/)?.[1]);
  let ld = null;
  $('script[type="application/ld+json"]').each((_, s) => {
    try { const j = JSON.parse($(s).html()); for (const g of j['@graph'] || [j]) if (g['@type'] === 'Product') ld = g; } catch { }
  });
  const name = clean($('h1.product_title').text());
  const $price = $('.summary .price, p.price').first();
  let price = null, regularPrice = null;
  if ($price.find('del').length) { regularPrice = money($price.find('del .amount').first().text()); price = money($price.find('ins .amount').first().text()); }
  else price = money($price.find('.amount').first().text());

  // variations
  let variations = [], attribute = null;
  const vdata = $('form.variations_form').attr('data-product_variations');
  if (vdata) {
    const label = clean($('table.variations th label').first().text()) || 'Option';
    const options = $('table.variations select option').map((_, o) => ({ value: $(o).attr('value'), label: clean($(o).text()) })).get().filter((o) => o.value);
    const key = $('table.variations select').attr('name') || 'attribute';
    attribute = { key, label, options };
    for (const v of JSON.parse(vdata)) {
      variations.push({
        id: v.variation_id, value: Object.values(v.attributes)[0], price: Math.round(v.display_price * 100),
        regularPrice: v.display_regular_price !== v.display_price ? Math.round(v.display_regular_price * 100) : null,
        image: v.image?.full_src ? media(v.image.full_src) : null, inStock: v.is_in_stock !== false,
      });
    }
    const ps = variations.map((v) => v.price);
    price = Math.min(...ps);
  }

  const images = [];
  $('.woocommerce-product-gallery img').each((_, i) => { const u = media(imgSrc($(i))); if (u && !images.includes(u)) images.push(u); });
  if (!images.length && ld?.image) { const u = media(ld.image); if (u) images.push(u); }
  const imageAlt = name; // stored alt texts on the old site were often for other products (audit finding)

  const reviews = $('ol.commentlist > li.review').map((_, li) => {
    const $li = $(li);
    return {
      author: clean($li.find('.woocommerce-review__author').first().text()),
      date: $li.find('time').attr('datetime') || null,
      rating: Number(($li.find('.star-rating').attr('aria-label') || '').match(/(\d+(?:\.\d+)?)/)?.[1] || 0),
      text: sanitize($, $li.find('.description').get(0), `review on ${slug}`),
    };
  }).get().filter((r) => r.text);

  const shortDescription = $('.woocommerce-product-details__short-description').length ? sanitize($, $('.woocommerce-product-details__short-description').get(0), `${slug} short description`) : '';
  const description = $('.wd-single-content').length ? sanitize($, $('.wd-single-content').get(0), `${slug} description`) : '';

  // template blocks repeated on every product page (bundle offers, help box): keep once
  for (const w of ['wd_infobox_carousel.default', 'wd_text_block.default']) {
    const $w = $(`[data-widget_type="${w}"]`).first();
    if ($w.length) { const key = w; const html = sanitize($, $w.get(0), 'product template ' + w); const m = sharedBlocks.get(key) || new Map(); m.set(html, (m.get(html) || 0) + 1); sharedBlocks.set(key, m); }
  }

  const cats = categories.filter((c) => c.products.includes(slug)).map((c) => c.slug);
  const crumb = ld ? null : null;
  products.push({
    id, slug, name, sku: ld?.sku ? String(ld.sku) : String(id),
    price, regularPrice, attribute, variations,
    images, imageAlt, shortDescription, description,
    categories: cats.length ? cats : ['uncategorized'],
    rating: ld?.aggregateRating ? Number(ld.aggregateRating.ratingValue) : null,
    reviewCount: reviews.length,
    reviews,
    inStock: !/outofstock/.test($('body').attr('class') || '') && !$('.summary .out-of-stock').length,
    seo: { title: clean($('title').text()), description: $('meta[name=description]').attr('content') || '' },
  });
}
// order products as the shop shows them
products.sort((a, b) => (shopOrder.indexOf(a.slug) + 1 || 9999) - (shopOrder.indexOf(b.slug) + 1 || 9999));

// ---------- pages ----------
const PAGES = ['about-us', 'contact-us', 'customer-support', 'privacy-policy', 'refund_returns', 'shipping-policy', 'terms-conditions', 'order-tracking'];
const pages = [];
for (const p of PAGES) {
  const f = `${p}/index.html`;
  if (!fs.existsSync(path.join(MIRROR, f)) || fs.statSync(path.join(MIRROR, f)).size === 0) { log.notes.push('missing page ' + p); continue; }
  const $ = load(f);
  const $content = $('[data-elementor-type="wp-page"]').first().length ? $('[data-elementor-type="wp-page"]').first() : $('.entry-content').first();
  $content.find('.woocommerce, form, [data-widget_type^="wd_track_order"], [data-widget_type^="wpcf7"]').remove();
  pages.push({
    slug: p.replace(/_/g, '-'), title: clean($('h1').first().text()) || clean($('title').text()).split(' - ')[0],
    html: sanitize($, $content.get(0), `page ${p}`),
    seo: { title: clean($('title').text()), description: $('meta[name=description]').attr('content') || '' },
  });
}

// ---------- navigation, footer, home ----------
const $home = load('index.html');
CURRENT_FILE = 'index.html';
const nav = $home('.wd-header-main-nav ul.menu > li, .whb-main-header nav ul.menu > li').first().parent().children('li').map((_, li) => {
  const $li = $home(li);
  return {
    label: clean($li.children('a').text()), href: route($li.children('a').attr('href')),
    children: $li.find('ul li > a').map((_, a) => ({ label: clean($home(a).text()), href: route($home(a).attr('href')) })).get(),
  };
}).get().filter((n) => n.label);

const footerCols = [];
$home('.wd-footer h5, .wd-footer .wd-title, footer h5').each((_, h) => {
  const title = clean($home(h).text());
  const links = $home(h).closest('.elementor-widget, .wd-widget, .widget, .e-con').find('a').map((_, a) => ({ label: clean($home(a).text()), href: route($home(a).attr('href')) })).get().filter((l) => l.label);
  if (title && links.length) footerCols.push({ title, links });
});

// Elementor slides: text in the page, background images in the page's generated CSS
const elementorCss = fs.readdirSync(path.join(MIRROR, 'wp-content/uploads/elementor/css')).filter((f) => f.startsWith('post-16340')).map((f) => read('wp-content/uploads/elementor/css/' + f)).join('\n');
const heroSlides = $home('.elementor-slides .swiper-slide').map((_, s) => {
  const $s = $home(s);
  const item = ($s.attr('class') || '').match(/elementor-repeater-item-[0-9a-f]+/)?.[0];
  const bg = item && elementorCss.match(new RegExp(item + ' \\.swiper-slide-bg\\{[^}]*background-image:url\\("?([^")]+)'))?.[1];
  return {
    title: clean($s.find('.elementor-slide-heading').text()), subtitle: clean($s.find('.elementor-slide-description').text()),
    cta: { label: clean($s.find('a.elementor-slide-button, a.elementor-button').text()) || 'Shop Now', href: route($s.find('a').attr('href')) || '/shop' },
    image: media(bg?.startsWith('http') ? bg : bg ? 'wp-content/uploads/' + bg.replace(/^(\.\.\/)+/, '') : null),
    imageAlt: $s.find('.swiper-slide-bg').attr('aria-label') || '',
  };
}).get().filter((s, i, a) => s.title && a.findIndex((x) => x.title === s.title) === i);

// Menu items that pointed at the homepage on the live site (no matching category exists):
// route them to the closest real destination.
const MENU_FIX = { Cartridges: '/shop?q=cartridge', Disposables: '/product-category/disposables', Flower: '/shop?q=flower', 'Infused Pre-rolls': '/shop?q=pre-roll', 'Wholesale Vape': '/contact-us' };
for (const n of nav) for (const c of n.children) if (c.href === '/' && MENU_FIX[c.label]) { log.contentFixes.push({ where: 'menu ' + c.label, removed: 'link to homepage', reason: 'menu item pointed to the homepage; now ' + MENU_FIX[c.label] }); c.href = MENU_FIX[c.label]; }

// Footer and home-page copy (text kept verbatim from the live site)
const footer = {
  about: [
    'At Muha Meds Store is to deliver premium, safe, and reliable cannabis-related products that customers can trust. We are dedicated to providing an exceptional experience built on quality, transparency, and responsibility. Through rigorous testing, ethical practices, and a customer-first approach, we aim to elevate industry standards and ensure every customer feels confident, valued, and supported.',
    'We strive to lead with integrity, innovate with purpose, and create products that reflect our commitment to safety, consistency, and excellence. Our mission is not only to serve but to set the standard for what a trusted cannabis brand should be.',
  ],
  logo: media('wp-content/uploads/2025/11/272735780a810ba63bdc2e5b4bd13882-removebg-preview.png'),
  badge: media('wp-content/uploads/2025/11/505c6619-47ec-4d71-90fa-8cca4151050b-removebg-preview-1.png'),
  columns: [
    { title: 'Products', links: Object.entries(MENU_FIX).map(([label, href]) => ({ label, href })) },
    { title: 'Company Policy', links: [{ label: 'Privacy Policy', href: '/privacy-policy' }, { label: 'Refund & Return Policy', href: '/refund-returns' }, { label: 'Terms & Conditions', href: '/terms-conditions' }, { label: 'Shipping Policy', href: '/shipping-policy' }] },
    { title: 'Costumer Service', links: [{ label: 'Order Tracking', href: '/order-tracking' }, { label: 'Customer Support', href: '/customer-support' }, { label: 'About Us', href: '/about-us' }, { label: 'Contact Us', href: '/contact-us' }] },
  ],
  copyright: '© Muha Meds Store. 2025. All Rights Reserved',
};
const home = {
  intro: {
    heading: ['Premium Quality', 'Standard', 'And Customer First Approach'],
    title: 'Premium Quality Standards',
    body: [
      'We are committed to delivering products of exceptional quality. From sourcing raw materials to final testing, every stage of our process is designed to maintain purity, potency, and consistency. We never compromise on quality because our customers deserve the best.',
      'We strive to provide a seamless experience, reliable support, and fast, secure delivery. Your satisfaction is our mission. Muha MEds',
    ],
  },
  marquee: [
    { icon: media('wp-content/uploads/2024/03/w-pas-m-icon-1.svg'), text: 'Free Shipping from $500!' },
    { icon: media('wp-content/uploads/2024/03/w-pas-m-icon-2.svg'), text: 'We have top quality Muha Products' },
    { icon: media('wp-content/uploads/2024/03/w-pas-m-icon-3.svg'), text: 'Fast and timely delivery' },
  ],
  banners: [
    { image: media('wp-content/uploads/2025/11/unnamed-26.jpg'), title: 'SALE PRODUCTS' },
    { image: media('wp-content/uploads/2025/11/unnamed-22.jpg'), title: 'NEW ARRIVALS' },
    { image: media('wp-content/uploads/2025/11/7cf5516c-f023-4186-a976-50c52a939a60-425x600.jpeg'), title: 'Now Available in stock' },
    { image: media('wp-content/uploads/2025/11/bb131311-7541-437e-8cac-e843113eac72-425x600.jpeg'), title: 'Available now  in Stock' },
    { image: media('wp-content/uploads/2025/11/58c5bc4a-ee8f-4348-a66e-89a0396250e0.jpeg'), title: 'Now Available in stock' },
  ],
  passion: {
    title: 'Passion for What We Do',
    body: [
      'Muha Meds Store is built by people who are passionate about quality, customer satisfaction, and innovation. Our passion fuels our commitment to excellence in every product we create and every service we provide',
      'We believe trust is earned through honesty. From clear product labels to transparent business practices, we operate with integrity at every level. Our commitment to ethical conduct ensures long-term relationships with our customers, partners, and community.',
    ],
    points: ['We believe in contributing positively to the communities we serve.', 'Every day, we evaluate our processes, customer feedback, and product performance', 'Growth and improvement drive our success.'],
    image: media('wp-content/uploads/2025/11/unnamed-15.jpg'),
  },
  help: { title: 'Need help choosing?', cta: 'Contact With Expert', href: '/contact-us' },
  services: [
    { icon: media('wp-content/uploads/2025/11/retail-2-shipping.svg'), title: 'FREE SHIPPING', text: 'Free shipping over $500' },
    { icon: media('wp-content/uploads/2025/11/retail-2-online-payment.svg'), title: 'ONLINE PAYMENT', text: 'Secure and Fast payment' },
    { icon: media('wp-content/uploads/2025/11/retail-2-support.svg'), title: '24/7 SUPPORT', text: 'Unlimited help desk' },
    { icon: media('wp-content/uploads/2025/11/retail-2-safe.svg'), title: '100% SAFE', text: 'Secure and Reliable' },
    { icon: media('wp-content/uploads/2025/11/retail-2-return.svg'), title: 'FREE RETURNS', text: 'Available' },
  ],
  featuredTitle: 'FEATURED PRODUCTS',
  featured: ['blue-slushie-muha-2g-disposable', 'watermelon-moonshine-distillate-disposable-2g', 'muha-pineapple-paradise-disposable-distillate', 'silver-super-haze-sativa'],
  bestSellersTitle: 'BEST SELLERS',
  bestSellers: ['master-box-muha', '2g-disposable-mix-pack-10-pcs', 'agent-orange-indica', 'agent-orange-mini', 'banana-cream-vape', 'blue-dream'],
};
log.notes.push('Not migrated: 15 home-page "Verified Customer" testimonials (stock/social-media photos with invented names) and the "Trustpilot 4.9 / 3574 reviews" badge (WoodMart demo text). Add real ones in src/data/site.json -> testimonials.');

// home product sections: keep the first rendered set of each titled block
const homeSections = [];
$home('[data-elementor-type="wp-page"] .wd-products-tabs, [data-elementor-type="wp-page"] .wd-products-element, [data-elementor-type="wp-page"] [data-widget_type^="wd_products"]').each((_, el) => {
  const $el = $home(el);
  const title = clean($el.find('.tabs-name, .wd-el-tabs-title, .title, h4').first().text());
  const slugs = cardSlugs(cheerio.load($home.html(el)));
  if (slugs.length && !homeSections.some((s) => s.products.join() === slugs.join())) homeSections.push({ title, products: slugs });
});

const site = {
  name: 'Muha Meds Store',
  tagline: clean($home('meta[name=description]').attr('content') || 'We have top quality Muha Meds products at affordable price'),
  logo: media($home('.site-logo img, .wd-logo img').first().attr('src')),
  favicon: media($home('link[rel=icon]').last().attr('href')),
  promoBar: clean($home('.wd-header-text').filter((_, e) => /promo code/i.test($home(e).text())).first().text()) || 'First purchase with a 10% discount, use promo code: WDPILLS23',
  nav, footer, heroSlides, homeSections, home, testimonials: [],
  paymentMethods: [
    { id: 'zelle-venmo', label: 'Zelle | Venmo' },
    { id: 'cashapp-crypto', label: 'Cashapp or crypto' },
    { id: 'chime', label: 'Chime' },
  ],
  shipping: { flatRate: 1000, freeOver: 50000 },
  coupons: [{ code: 'WDPILLS23', percent: 10, firstOrderOnly: true }],
  email: (read('index.html').match(/[\w.]+@muhamedstore\.com/i) || ['info@Muhamedstore.com'])[0],
  address: '634 Kohler St, Los Angeles, CA 90021, USA',
};

// shared product-template blocks: take the variant used on most pages
const productTemplate = {};
for (const [k, m] of sharedBlocks) productTemplate[k.split('.')[0]] = [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];

const write = (n, d) => fs.writeFileSync(path.join(DATA, n), JSON.stringify(d, null, 1));
write('products.json', products);
write('categories.json', categories);
write('pages.json', pages);
write('site.json', { ...site, productTemplate });
write('extract-log.json', log);
console.log({ products: products.length, categories: categories.map((c) => `${c.slug}:${c.products.length}`), pages: pages.length, images: [...copied.values()].filter(Boolean).length, missingImages: log.missingImages.length, contentFixes: log.contentFixes.length, nav: nav.length, heroSlides: heroSlides.length, homeSections: homeSections.length, shopOrder: shopOrder.length });
