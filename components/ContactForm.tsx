'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [state, setState] = useState<{ status: 'idle' | 'sending' | 'done' | 'error'; error?: string; fields?: Record<string, string> }>({ status: 'idle' });
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState({ status: 'sending' });
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(fd)) }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setState(res?.ok ? { status: 'done' } : { status: 'error', error: data?.error ?? 'Could not send your message. Please email us instead.', fields: data?.fieldErrors });
  }
  if (state.status === 'done') return <p role="status" className="rounded-2xl bg-sage-50 p-6 text-sage-700">Thank you for your message. It has been sent — we&apos;ll get back to you shortly.</p>;
  const err = (k: string) => state.fields?.[k];
  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-[2rem] border border-line bg-white p-6 sm:p-8">
      <h2 className="h-display text-2xl">Send us a message</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="c-name" className="label">Your name *</label><input id="c-name" name="name" required autoComplete="name" className="field" aria-invalid={!!err('name')} />{err('name') && <p className="mt-1 text-sm text-sale">{err('name')}</p>}</div>
        <div><label htmlFor="c-email" className="label">Your email *</label><input id="c-email" name="email" type="email" required autoComplete="email" className="field" aria-invalid={!!err('email')} />{err('email') && <p className="mt-1 text-sm text-sale">{err('email')}</p>}</div>
      </div>
      <div><label htmlFor="c-subject" className="label">Subject</label><input id="c-subject" name="subject" className="field" /></div>
      <div><label htmlFor="c-message" className="label">Your message *</label><textarea id="c-message" name="message" rows={5} required className="field" aria-invalid={!!err('message')} />{err('message') && <p className="mt-1 text-sm text-sale">{err('message')}</p>}</div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.status === 'error' && <p role="alert" className="text-sm text-sale">{state.error}</p>}
      <button className="btn btn-primary" disabled={state.status === 'sending'}>{state.status === 'sending' ? 'Sending…' : 'Submit'}</button>
    </form>
  );
}
