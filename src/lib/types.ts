export type Cents = number;

export interface Variation {
  id: number;
  value: string;
  price: Cents;
  regularPrice: Cents | null;
  image: string | null;
  inStock: boolean;
}

export interface Review {
  author: string;
  date: string | null;
  rating: number;
  text: string; // sanitized HTML
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  sku: string;
  price: Cents; // lowest price for variable products
  regularPrice: Cents | null;
  attribute: { key: string; label: string; options: { value: string; label: string }[] } | null;
  variations: Variation[];
  images: string[];
  imageAlt: string;
  shortDescription: string;
  description: string;
  categories: string[];
  rating: number | null;
  reviewCount: number;
  reviews: Review[];
  inStock: boolean;
  seo: { title: string; description: string };
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  products: string[];
  seo: { title: string; description: string };
}

export interface Page {
  slug: string;
  title: string;
  html: string;
  seo: { title: string; description: string };
}

export interface NavItem { label: string; href: string; children: { label: string; href: string }[] }

export interface PaymentMethod { id: string; label: string; instructions?: string }

export interface Coupon { code: string; percent: number; firstOrderOnly?: boolean }

export interface Site {
  name: string;
  tagline: string;
  logo: string;
  favicon: string;
  promoBar: string;
  email: string;
  address: string;
  nav: NavItem[];
  footer: {
    about: string[];
    logo: string;
    badge: string;
    columns: { title: string; links: { label: string; href: string }[] }[];
    copyright: string;
  };
  heroSlides: { title: string; subtitle: string; cta: { label: string; href: string }; image: string; imageAlt: string }[];
  homeSections: { title: string; products: string[] }[];
  home: {
    intro: { heading: string[]; title: string; body: string[] };
    marquee: { icon: string; text: string }[];
    banners: { image: string; title: string }[];
    passion: { title: string; body: string[]; points: string[]; image: string };
    help: { title: string; cta: string; href: string };
    services: { icon: string; title: string; text: string }[];
    featuredTitle: string;
    featured: string[];
    bestSellersTitle: string;
    bestSellers: string[];
  };
  testimonials: { name: string; location?: string; text: string; image?: string }[];
  paymentMethods: PaymentMethod[];
  shipping: { flatRate: Cents; freeOver: Cents };
  coupons: Coupon[];
  productTemplate: { wd_infobox_carousel?: string; wd_text_block?: string };
}

/** What the browser keeps in the cart. Prices here are display snapshots only;
 *  the server re-prices every line from the catalog when quoting or ordering. */
export interface CartLine {
  slug: string;
  variationId: number | null;
  qty: number;
  name: string;
  option: string | null;
  image: string;
  unitPrice: Cents;
}
