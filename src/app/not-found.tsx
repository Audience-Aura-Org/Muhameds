import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="h-display mt-3 text-4xl sm:text-5xl">This page can&apos;t be found</h1>
      <p className="mx-auto mt-4 max-w-md text-ink-soft">It looks like nothing was found at this location. Try the shop or search for a product.</p>
      <form action="/shop" className="mx-auto mt-8 flex max-w-md gap-2" role="search">
        <label htmlFor="nf-q" className="sr-only">Search products</label>
        <input id="nf-q" name="q" type="search" placeholder="Search for products" className="field" />
        <button className="btn btn-primary">Search</button>
      </form>
      <Link href="/" className="mt-6 inline-block font-semibold text-sage-700 hover:underline">Back to home</Link>
    </div>
  );
}
