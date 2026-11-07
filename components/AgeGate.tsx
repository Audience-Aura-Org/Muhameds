'use client';
import { useEffect, useState } from 'react';

export const AGE_KEY = 'mm-age-ok';
const MAX_AGE_MS = 30 * 864e5;

/**
 * Runs in <head> before first paint: marks <html class="age-ok"> for visitors who confirmed
 * within the last 30 days. The gate below is server-rendered and hidden by CSS for them, so
 * first-time visitors see it immediately (no flash of content, no post-hydration re-layout)
 * and returning visitors never see it at all.
 */
export const ageGateBootScript = `(function(){var c=document.documentElement.classList,ok=false;try{var v=+localStorage.getItem(${JSON.stringify(AGE_KEY)});ok=!!v&&Date.now()-v<${MAX_AGE_MS}}catch(e){}c.add(ok?'age-ok':'age-pending')})()`;

/** 21+ confirmation shown once per browser (30 days). Styles: `.age-gate` in globals.css. */
export default function AgeGate() {
  const [open, setOpen] = useState(true);
  const [denied, setDenied] = useState(false);

  // Verified visitors: the boot script already hid the gate; drop it from the DOM entirely.
  useEffect(() => { if (document.documentElement.classList.contains('age-ok')) setOpen(false); }, []);

  if (!open) return null;
  const confirm = () => {
    try { localStorage.setItem(AGE_KEY, String(Date.now())); } catch { /* private mode: confirm for this visit only */ }
    document.documentElement.classList.replace('age-pending', 'age-ok');
    setOpen(false);
  };

  return (
    <div className="age-gate fixed inset-0 z-[90] grid place-items-center bg-ink/90 p-4" role="dialog" aria-modal="true" aria-labelledby="age-title">
      <div className="w-full max-w-md rounded-3xl bg-paper p-7 text-center shadow-lift sm:p-10">
        {denied ? (
          <>
            <h2 id="age-title" className="h-display text-2xl">Sorry</h2>
            <p className="mt-3 text-ink-soft">You must be 21 or older to visit this site.</p>
          </>
        ) : (
          <>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink font-display text-lg font-bold text-lime">21+</span>
            <p className="eyebrow mt-5">Age verification</p>
            <h2 id="age-title" className="h-display mt-3 text-[28px] leading-tight sm:text-3xl">Are you 21 or older?</h2>
            <p className="mt-3 text-ink-soft">You must be of legal age to view and purchase these products.</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button type="button" className="btn btn-lg btn-ghost" onClick={() => setDenied(true)}>No</button>
              <button type="button" className="btn btn-lg btn-primary px-4" onClick={confirm} autoFocus>Yes, I&apos;m 21+</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
