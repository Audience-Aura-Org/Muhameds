'use client';
import { useEffect, useState } from 'react';

const KEY = 'mm-age-ok';

/** 21+ confirmation shown once per browser (30 days). */
export default function AgeGate() {
  const [open, setOpen] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(KEY) || 0);
      if (!v || Date.now() - v > 30 * 864e5) setOpen(true);
    } catch { setOpen(true); }
  }, []);
  useEffect(() => { document.documentElement.style.overflow = open ? 'hidden' : ''; }, [open]);

  if (!open) return null;
  const confirm = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ } setOpen(false); };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="age-title">
      <div className="w-full max-w-md rounded-3xl bg-paper p-8 text-center shadow-2xl">
        {denied ? (
          <>
            <h2 id="age-title" className="h-display text-2xl">Sorry</h2>
            <p className="mt-3 text-ink-soft">You must be 21 or older to visit this site.</p>
          </>
        ) : (
          <>
            <p className="eyebrow">Age verification</p>
            <h2 id="age-title" className="h-display mt-3 text-3xl">Are you 21 or older?</h2>
            <p className="mt-3 text-ink-soft">You must be of legal age to view and purchase these products.</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button className="btn btn-ghost" onClick={() => setDenied(true)}>No</button>
              <button className="btn btn-primary" onClick={confirm} autoFocus>Yes, I am 21+</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
