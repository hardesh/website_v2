'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import styles from './TopBar.module.css';

interface Props {
  name: string;
  nav: { label: string; href: string }[];
  showToggle?: boolean;
}

export default function TopBar({ name, nav, showToggle = true }: Props) {
  const pathname = usePathname() || '/';
  const tabs = useRef<HTMLElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(href + '/');

  useEffect(() => {
    const el = tabs.current;
    if (!el) return;
    const update = () => {
      setAtStart(el.scrollLeft <= 2);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
    };
    // Bring the current page's tab into view without moving the page vertically.
    const current = el.querySelector<HTMLElement>('[aria-current="page"]');
    if (current && el.scrollWidth > el.clientWidth) {
      const target = current.offsetLeft - el.offsetLeft - (el.clientWidth - current.offsetWidth) / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: 'instant' as ScrollBehavior });
    }
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pathname]);

  const scroll = (dx: number) => tabs.current?.scrollBy({ left: dx });

  return (
    <header className={styles.bar}>
      <Link href="/" className={styles.name}>
        {name}
      </Link>
      <div className={styles.tabsWrap}>
        <button type="button" className={styles.arrow} onClick={() => scroll(-160)} aria-label="Scroll pages left" data-hidden={atStart} tabIndex={atStart ? -1 : 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <nav className={styles.tabs} aria-label="Pages" ref={tabs} data-at-start={atStart} data-at-end={atEnd}>
          {nav.map((t) => (
            <Link key={t.href} href={t.href} className="mono" aria-current={isCurrent(t.href) ? 'page' : undefined}>
              {t.label}
            </Link>
          ))}
        </nav>
        <button type="button" className={styles.arrow} onClick={() => scroll(160)} aria-label="Scroll pages right" data-hidden={atEnd} tabIndex={atEnd ? -1 : 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {showToggle ? (
        <ThemeToggle className={styles.toggle} />
      ) : (
        // Home has no toggle, but keeps an invisible one so the tabs sit in exactly the same place on every page.
        <div className={styles.toggleSpacer} aria-hidden="true" inert>
          <ThemeToggle className={styles.toggle} />
        </div>
      )}
    </header>
  );
}
