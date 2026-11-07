import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({ width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p });

export const IconSearch = (p: P) => <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const IconBag = (p: P) => <svg {...base(p)}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>;
export const IconHeart = ({ filled, ...p }: P & { filled?: boolean }) => <svg {...base(p)} fill={filled ? 'currentColor' : 'none'}><path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9Z" /></svg>;
export const IconMenu = (p: P) => <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
export const IconClose = (p: P) => <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const IconChevron = (p: P) => <svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>;
export const IconChevronDown = (p: P) => <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>;
export const IconStore = (p: P) => <svg {...base(p)}><path d="M4 9 5.5 4h13L20 9" /><path d="M4 9h16v2a3 3 0 0 1-5 2 3 3 0 0 1-6 0 3 3 0 0 1-5-2V9Z" /><path d="M5 13v7h14v-7" /></svg>;
export const IconTruck = (p: P) => <svg {...base(p)}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>;
export const IconCheck = (p: P) => <svg {...base(p)}><path d="m5 12 5 5 9-10" /></svg>;
export const IconMinus = (p: P) => <svg {...base(p)}><path d="M5 12h14" /></svg>;
export const IconPlus = (p: P) => <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>;
export const IconTrash = (p: P) => <svg {...base(p)}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>;
export const IconMail = (p: P) => <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
export const IconPin = (p: P) => <svg {...base(p)}><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>;
export const IconStar = ({ filled = true, ...p }: P & { filled?: boolean }) => (
  <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden {...p}><path fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z" /></svg>
);
