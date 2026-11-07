import type { Metadata } from 'next';
import { getPage } from '@/lib/catalog';
import TrackForm from './TrackForm';

export const metadata: Metadata = { title: 'Order Tracking', alternates: { canonical: '/order-tracking' } };

export default function OrderTrackingPage() {
  const page = getPage('order-tracking');
  return (
    <div className="container-x max-w-4xl pt-8 sm:pt-12">
      <h1 className="h-display mb-8 text-4xl leading-[1.05] sm:mb-10 sm:text-[56px]">Order Tracking</h1>
      <TrackForm />
      {page?.html && <div className="rich mt-12" dangerouslySetInnerHTML={{ __html: page.html.replace(/^\s*<h2>Order Tracking<\/h2>/, '') }} />}
    </div>
  );
}
