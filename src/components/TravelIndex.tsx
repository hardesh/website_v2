'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import EntryCard, { type CardData } from './EntryCard';
import TravelMap, { type MapPin } from './TravelMap';
import styles from './TravelIndex.module.css';

export interface TravelItem extends CardData {
  year: string;
  lat?: number;
  lon?: number;
  group?: string;
}

interface Props {
  items: TravelItem[]; // newest first
  places: { name: string; lat: number; lon: number }[];
  home: { name: string; lat: number; lon: number };
  /** The story marked `home: true` (Pune), shown in its own row above the grid. */
  homeStory?: TravelItem;
}

/** Map + year filter + cards. The filter updates pins and cards together; places without a story always show. */
export default function TravelIndex({ items, places, home, homeStory }: Props) {
  const [year, setYear] = useState('All');
  const years = useMemo(() => ['All', ...Array.from(new Set(items.map((i) => i.year).filter(Boolean)))], [items]);
  const shown = year === 'All' ? items : items.filter((i) => i.year === year);

  const pins = useMemo(() => {
    const out: MapPin[] = [];
    const byKey = new Map<string, MapPin>();
    for (const e of shown) {
      if (e.lat == null || e.lon == null) continue;
      const key = e.group || e.url;
      const existing = byKey.get(key);
      if (existing) {
        existing.label += ` · ${e.title}`;
        continue;
      }
      const pin: MapPin = { key, label: e.title, lat: e.lat, lon: e.lon, href: e.url };
      byKey.set(key, pin);
      out.push(pin);
    }
    const storyLabels = new Set(out.map((p) => p.label.toLowerCase()));
    for (const p of places) {
      const label = p.name.split(',')[0].trim();
      if (storyLabels.has(label.toLowerCase())) continue;
      out.push({ key: `place:${p.name}`, label, lat: p.lat, lon: p.lon });
    }
    return out;
  }, [shown, places]);

  return (
    <>
      <TravelMap pins={pins} home={home} homeHref={homeStory?.url} />

      {homeStory && (
        <section className="wrap" style={{ paddingTop: 56 }} aria-labelledby="home-row-h">
          <Link href={homeStory.url} className={styles.homeRow}>
            {homeStory.cover ? (
              <Image className={styles.homeImg} src={homeStory.cover.src} alt={homeStory.cover.alt} width={homeStory.cover.width} height={homeStory.cover.height} sizes="(max-width: 760px) 100vw, 360px" />
            ) : (
              <div className={`${styles.homeImg} ${styles.homeImgEmpty}`} aria-hidden="true">
                <span className="dot dot--ring" />
              </div>
            )}
            <div className={styles.homeText}>
              <p className="mono label-accent">Home</p>
              <h2 id="home-row-h" className={styles.homeTitle}>
                {homeStory.title}
              </h2>
              {homeStory.place && <p className={`mono ${styles.homePlace}`}>{homeStory.place}</p>}
              {homeStory.summary && <p className={styles.homeSummary}>{homeStory.summary}</p>}
            </div>
          </Link>
        </section>
      )}

      {years.length > 2 && (
        <section className="wrap" style={{ paddingTop: 56 }}>
          <div role="group" aria-label="Filter by year" className={styles.years}>
            {years.map((y) => (
              <button key={y} type="button" className="mono year-btn" aria-pressed={y === year} onClick={() => setYear(y)}>
                {y}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="wrap" style={{ paddingTop: 48 }} aria-label="Stories">
        <h2 className="visually-hidden">Stories</h2>
        {shown.length ? (
          <div className={styles.cards}>
            {shown.map((e, i) => (
              <EntryCard key={e.url} e={e} priority={i === 0} />
            ))}
          </div>
        ) : (
          <p className="empty">No stories yet.</p>
        )}
      </section>
    </>
  );
}
