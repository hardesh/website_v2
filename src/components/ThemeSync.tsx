'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Keeps data-theme right across client-side navigation: Home is always dark, other pages use the stored choice. */
export default function ThemeSync() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (pathname === '/') {
      root.dataset.theme = 'dark';
      return;
    }
    let t: string | null = null;
    try {
      t = localStorage.getItem('theme');
    } catch {}
    if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    root.dataset.theme = t;
  }, [pathname]);
  return null;
}
